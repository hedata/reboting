import {Component, Input, OnInit} from '@angular/core';
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

  showLogin = true;
  ngOnInit(): void {
    console.log('Init Splash');
    this.showLogin = !this.authService.isAuthenticated()
  }
  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {
  }
  onMainButtonClicked() {
    if(!this.authService.isAuthenticated()) {
      this.authService.login();
    }
    /*
    this.dataService.emitChange({
      message: 'directbotrequest',
      data: 'show me what you got'
    });
    */
  }
  onLogoutButtonClicked() {
    if(this.authService.isAuthenticated()) {
      console.log('logging out');
      this.authService.logout();
      this.showLogin = true;
    }
  }
}
