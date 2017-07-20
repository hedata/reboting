// src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/filter';

@Injectable()
export class AuthService {


  constructor() {
    console.log('in the auth0 constructor');
  }

  public login(): void {
    console.log('login');
  }

  // ...
  public handleAuthentication(): void {
    console.log('handling authentication');
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
  }

  public logout(): void {
    // Go back to the home route
    // this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    return false;
  }

}
