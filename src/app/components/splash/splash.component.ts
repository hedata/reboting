import {Component, Input, NgZone, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';
import annyang from 'annyang';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  @Input()
  showComponent: String;
  ngOnInit(): void {
    console.log('Init Splash');
  }
  constructor(
    private dataService: DataService
  ) {
  }
  onMainButtonClicked() {
    this.dataService.emitChange({
      message: 'directbotrequest',
      data: 'show me what you got'
    });
  }
}
