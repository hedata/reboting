import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppStore } from './../../models/app-store.model';
import { Response } from './../../models/response.model';

import { BotService } from './../../services/bot.service';
import { BotQueryResponse } from './../../models/bot-query-response.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent implements OnInit {
  botChat = [];
  constructor(
    private dataService: DataService
  ) {
  }

  ngOnInit() {
    let query = 'Hi';
    this.botChat.push({you:  query});
    this.dataService.postAction('query',{query: query}).subscribe(data => {
      console.log(data);
      this.botChat.push(data);
      this.dataService.emitChange({
        message: 'botanswer',
        data: data
      });
    });
  }
  queryBot(query: string) {
    console.log('enter: ' + query);
    this.botChat.push({you:  query});
    this.dataService.postAction('query',{query: query}).subscribe(data => {
      console.log(data);
      this.botChat.push(data);
      this.dataService.emitChange({
        message: 'botanswer',
        data: data
      });
    });
    /*
    this.store.dispatch({type: 'NEW_MESSAGE', payload: query});
    this.botService.queryBot(query);
    */
  }

}
