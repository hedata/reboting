import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppStore } from './../../models/app-store.model';

import { BotService } from './../../services/bot.service';
import { BotQueryResponse } from './../../models/bot-query-response.model';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent implements OnInit {
  chat: string[];
  uploadState: Observable<boolean>;
  botChat: string[];

  constructor(
    private store: Store<AppStore>,
    private botService: BotService
  ) {
    this.uploadState = this.store.select('uploadState');
    this.botChat = [];
  }

  ngOnInit() {
  }

  // TODO Refactor so query and response are a Array Store and don't just represent the current query and response,
  // in this case storing is kind of useless
  queryBot(query: string) {
    this.store.dispatch({type: 'NEW_QUERY', payload: query});
    this.botChat.push(query);
    this.botService.queryBot(query).subscribe(
      botQueryResponse => {
        this.store.dispatch({type: 'NEW_RESPONSE', payload: botQueryResponse});
        this.botChat.push(botQueryResponse.speech);
      }
    );
  }

}
