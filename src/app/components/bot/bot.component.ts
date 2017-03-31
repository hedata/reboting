import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppStore } from './../../models/app-store.model';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent implements OnInit {
  chat: string[];
  uploadState: Observable<boolean>;

  constructor(private store: Store<AppStore>) {
    this.uploadState = this.store.select('uploadState');
  }

  ngOnInit() {
  }

}
