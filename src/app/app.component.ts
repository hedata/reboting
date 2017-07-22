import {Component, NgZone, OnInit} from '@angular/core';
import {DataService} from './services/data.service';
import {AuthService} from './services/auth.service';

declare const FB: any ;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DataService, AuthService]
})

/*

 */


export class AppComponent implements OnInit {
  public showComponent: String = 'splash';
  constructor(private dataService: DataService,
              private authService: AuthService,
              private _ngZone: NgZone
             ) {
    console.log('App Component constructor');
    dataService.changeEmitted$.subscribe(
      data => {
        switch (data.message) {
          case 'botanswer':
            const response = data.data;
            if (response.script) {
              console.log('App show visual');
              this.showComponent = 'visual';
            }
            if(response.opendata_search_results) {
              console.log('App show opendata');
              this.showComponent = 'opendata';
            }
            break;
          case 'show_visual':
            console.log('App show visual');
            this.showComponent = 'visual';
            break;
          case 'notloggedin':
            this._ngZone.run(() => {
              console.log('App not logged in');
              this.showComponent = 'splash';
            });
            break;
        }
      });
  }
  ngOnInit(): void {
    this.authService.setDataService(this.dataService);
    this.dataService.setAuthService(this.authService);
    this.authService.checkAuthStatus();
  }

}
