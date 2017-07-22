import {Component, Input, NgZone, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';
import {AuthService} from '../../services/auth.service';


@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  @Input()
  showComponent: String;

  showLogin = false;
  ngOnInit(): void {
    console.log('Init Splash');
  }
  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private _zone: NgZone
  ) {
    console.log('constructor Splash');
    dataService.changeEmitted$.subscribe(
      data => {
        // which change was it?
        switch (data.message) {
          case 'login':
            this._zone.run(() => {
              console.log('Splash: login is here');
              this.showLogin = false;
            });
            break;
          case 'notloggedin':
            this._zone.run(() => {
              console.log('Splash: not logged in ');
              this.showLogin = true;
            });
            break;
        }
      }
    );
  }
  onLoginClicked() {
    this.authService.login();
  }
}
