import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { DataService } from './data.service';
import { BotQueryResponse } from './../models/bot-query-response.model';

@Injectable()
export class BotService {

  constructor(
    private dataService: DataService
   ) { }

   // Takes a string as payload and gives back a botQueryResponse to which we can subscribe
   queryBot(payload: string): Observable<BotQueryResponse> {
     return this.dataService.postAction('query', {query: payload})
              .map((data) => {
                return new BotQueryResponse(payload, data.bot_response.result.fulfillment.speech);
              });
   }

}
