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
    const query = 'Show me a bokeh plot';
    this.botChat.push({you:  query});
    this.dataService.postAction('query', {query: query}).subscribe(data => {
      console.log(data);
      this.botChat.push(data);
      this.dataService.emitChange({
        message: 'botanswer',
        data: data
      });
      // temporary action for testing finding a visual - hardcoded ! 591584e35a2b8200abacd959
      /*
      this.dataService.postAction('show_visual', {
        visual_id : '591591ad79373d01bf510471'
      }).subscribe(data => {
          console.log('response For show Visual Message');
          console.log(data);
          this.dataService.emitChange({
            message: 'show_visual',
            data: data
          });
        }
      );
      */
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
