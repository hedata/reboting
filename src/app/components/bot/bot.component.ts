import {Component, NgZone, OnInit} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppStore } from './../../models/app-store.model';
import { Response } from './../../models/response.model';

import { BotService } from './../../services/bot.service';
import { BotQueryResponse } from './../../models/bot-query-response.model';
import { DataService } from '../../services/data.service';
import annyang from 'annyang';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent implements OnInit {
  botChat = [];
  msg = new SpeechSynthesisUtterance();
  voices;

  chatmessage: String = '' ;
  constructor(
    private dataService: DataService,
    private _ngZone: NgZone
  ) {
    /*
      setting base synthesis options
     */
    this.msg.volume = 1;							// 0 to 1
    this.msg.rate = 0.9;							// 0.1 to 10
    this.msg.pitch = 0;							// 0 to 2
    this.msg.lang = 'en-US';
    const that = this;
    window.speechSynthesis.onvoiceschanged = function () {
      that.voices = speechSynthesis.getVoices();
      that.msg.voice = that.voices[3];
      console.log('VOICES');
      // console.log(that.voices);
    };
  }

  sendCommand(val) {
    console.log('executing Voice Commands' + val);
    this._ngZone.run(() => {
      this.chatmessage = val;
      this.queryBot();
    });
  }

  ngOnInit() {
    this.chatmessage = 'Show me a bokeh plot';
    this.queryBot();
    // Let's define our first command. First the text we expect, and then the function it should call
    const commands = {
      'okay then*val': (val) => {
        console.log('command start');
        this.sendCommand(val);
      },
      'okay Ben*val': (val) => {
        console.log('command start');
        this.sendCommand(val);
      }
    };
    // Trying to start annyang
    annyang.addCommands(commands);

    annyang.addCallback('error', function (err)
    {
      console.log('error in annyang');
      console.log(err);
      if(err.error === 'no-speech') {
        if ( !annyang.isListening() ) {
          annyang.start();
        }
      }
    });

    // Start listening. You can call this here, or attach this call to an event, button, etc.
    annyang.start({ autoRestart: true , continuous: false});
    /*
    // temporary action for testing finding a visual - hardcoded ! 591584e35a2b8200abacd959
    this.dataService.postAction('show_visual', {
      visual_id : '5915ce19b52242002d8c9a17'
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
  }
  queryBot() {
    const query = this.chatmessage;
    console.log('enter: ' + query);
    this.botChat = [];
    this.botChat.push({you:  query});
    this.dataService.postAction('query',{query: query}).subscribe(data => {
      console.log(data);
      this.botChat.push(data);
      this.chatmessage = '';
      this.dataService.emitChange({
        message: 'botanswer',
        data: data
      });
      // setup synthesis
      const voices = window.speechSynthesis.getVoices();
      console.log('Speech Synthesis');
      console.log(voices);
      this.msg.text = data.bot_response.result.fulfillment.speech;
      speechSynthesis.speak(this.msg);
    });
    /*
    this.store.dispatch({type: 'NEW_MESSAGE', payload: query});
    this.botService.queryBot(query);
    */
  }

}
