// src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/filter';
import {DataService} from './data.service';
declare const FB: any ;



@Injectable()
export class AuthService {
  private dataService: DataService;
  private userData: any = {};

  constructor() {
    console.log('in the auth0 constructor');
  }
  public setDataService(dataService: DataService) {
    this.dataService = dataService;
  }
  public login(): void {
    FB.login((response) => {
      if (response.status === 'connected') {
       this.setUserData();
      } else {
        // The person is not logged into this app or we are unable to tell.
      }
    },{scope: 'email,public_profile,read_insights,pages_show_list'});
  }
  private setUserData(): void {
    // we are logged in so lets have fun
    FB.api('/me?fields=email,first_name,last_name,name', (userData) => {
      console.log('got user data from facebook');
      console.log(userData);
      this.userData.email = userData.email;
      this.userData.name = userData.name;
      this.userData.id = userData.id;
      // get the profile pic
      FB.api('me/picture', (picture) => {
        console.log('/picture');
        console.log(picture);
        this.userData.profile_pic = picture.data.url;
        console.log(this.userData);
        this.dataService.emitChange({
          message: 'login',
          data: this.userData
        });
      });
    });
    // more infos not used atm
    /*
    FB.api('/me/permissions', (response4) => {
      console.log('/permissions');
      console.log(response4);
    });
    FB.api('/me/accounts', (response3) => {
      console.log('/accounts response');
      console.log(response3);
    });
    FB.api('1330857133638462/insights/page_fan_adds_unique',(response3) => {
      console.log('/accounts response');
      console.log(response3);
    });
    */
  }

  public logout(): void {
    FB.logout((response) => {
      console.log(response);
    });
  }

  public checkAuthStatus(): void {
    if(typeof FB !== 'undefined') {
      FB.getLoginStatus((response) => {
        console.log('response from login status!');
        console.log(response);
        if (response.status === 'connected') {
          this.setUserData();
        } else {
          this.dataService.emitChange({
            message: 'notloggedin',
            data: {}
          });
        }
      });
    } else {
      console.log('OHOH facebook not loaded trying again');
      setTimeout(() => { this.checkAuthStatus(); }, 200);
    }
  }

}
