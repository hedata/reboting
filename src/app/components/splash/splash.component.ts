import {Component, Input, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';
import {AuthService} from '../../services/auth.service';

declare const FB: any ;

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  @Input()
  showComponent: String;

  showLogin = true;
  ngOnInit(): void {
    console.log('Init Splash');
  }
  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {
    dataService.changeEmitted$.subscribe(
      data => {
        console.log('Splash Reacting to change');
        console.log(data);
        // which change was it?
        switch (data.message) {
          case 'login':
            console.log('login is here');
            this.showLogin = false;
            break;
          default:
            console.log('error');
            console.log(data);
        }
      }
    );
  }
  onLoginClicked() {
    FB.login((response) => {
      if (response.status === 'connected') {
        // Logged into your app and Facebook.
        console.log('YEAH ');
        console.log(response);
        this.showLogin = false;
        FB.api('/me/permissions', (response4) => {
          console.log('/me response');
          console.log(response4);
        });
        FB.api('/me?fields=email,first_name,last_name,name', (response2) => {
          console.log('/me response');
          console.log(response2);
        });
        FB.api('/me/accounts',(response3) => {
          console.log('/accounts response');
          console.log(response3);
        });
        FB.api('me/picture',(response3) => {
          console.log('/accounts response');
          console.log(response3);
        });
        FB.api('1330857133638462/insights/page_fan_adds_unique',(response3) => {
          console.log('/accounts response');
          console.log(response3);
        });

      } else {
        // The person is not logged into this app or we are unable to tell.
      }
    },{scope: 'email,public_profile,read_insights,pages_show_list'});
  }
  onLogoutButtonClicked() {
    FB.logout(function(response) {
      console.log(response);
      this.showLogin = true;
      // Person is now logged out
    });
  }
}
