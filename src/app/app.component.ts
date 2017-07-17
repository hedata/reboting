import { Component } from '@angular/core';
import {DataService} from './services/data.service';
import {AuthService} from "./services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DataService, AuthService]
})

/*

 */


export class AppComponent {
  public showComponent: String = 'splash';
  constructor(private dataService: DataService,
              private authService: AuthService) {
    console.log('App Component constructor');
    this.authService.handleAuthentication();
    if(!this.authService.isAuthenticated()) {
      this.authService.login();
    }
    dataService.changeEmitted$.subscribe(
      data => {
        console.log('App reacting to change');
        console.log(data);
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
            console.log('error');
            console.log(data);
        }
      });
  }

}
