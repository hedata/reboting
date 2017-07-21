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
             ) {
    console.log('App Component constructor');
    this.authService.setDataService(dataService);
    this.authService.checkAuthStatus();
    this.dataService.setAuthService(authService);
    dataService.changeEmitted$.subscribe(
      data => {
        console.log('App reacting to change');
        // console.log(data);
        // which change was it?
        switch (data.message) {
          case 'botanswer':
            const response = data.data;
            if (response.script) {
              this.showComponent = 'visual';
            }
            if(response.opendata_search_results) {
              this.showComponent = 'opendata';
            }
            break;
          case 'show_visual':
            this.showComponent = 'visual';
            break;
          default:
            console.log('not me');
            // console.log(data);
        }
      });
  }
  ngOnInit(): void {

  }

}
