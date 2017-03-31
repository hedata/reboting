import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { DataService } from './data.service';
import { BotQueryResponse } from './../models/bot-query-response.model';
import { AppStore } from './../models/app-store.model';

@Injectable()
export class BotService {

  constructor(
    private dataService: DataService,
    private store: Store<AppStore>
   ) { }

   // Takes a string as payload and gives back a botQueryResponse to which we can subscribe
   queryBot(payload: string) {

    /*
    this.store.dispatch({type: 'NEW_QUERY', payload: query});
    this.botChat.push(query);
    this.botService.queryBot(query).subscribe(
      botQueryResponse => {
        this.store.dispatch({type: 'NEW_RESPONSE', payload: botQueryResponse});
        this.botChat.push(botQueryResponse.speech);
      }
    )
    */

     this.dataService.postAction('query', {query: payload})
              .map((data) => data.bot_response.result.fulfillment.speech )
              .subscribe( response => {
                console.log('bot chat response: ');
                console.log(response);
                this.store.dispatch({type: 'NEW_MESSAGE', payload: response})
              });
   }

}
