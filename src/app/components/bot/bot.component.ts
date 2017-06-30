import {Component, NgZone, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';
import annyang from 'annyang';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent implements OnInit {
  public configModel: any = {recording: false, synthesis: true, autorecord: false};
  public quickreplies = [];
  botChat = [];
  msg = new SpeechSynthesisUtterance();
  showchatlog = false;
  voices;
  private commands_listen = {
    'okay then*val': (val) => {
      console.log('command start');
      this.sendCommand(val);
    },
    'okay Ben*val': (val) => {
      console.log('command start');
      this.sendCommand(val);
    }
  };
  private commands_record = {
    '*val': (val) => {
      console.log('command start');
      this.sendCommand(val);
    }
  };
  chatmessage: String = '' ;
  constructor(
    private dataService: DataService,
    private _ngZone: NgZone
  ) {
    /*
      setting base synthesis options
     */
    try {
      this.msg.volume = 1;							// 0 to 1
      this.msg.rate = 0.8;							// 0.1 to 10
      this.msg.pitch = 0;							// 0 to 2
      this.msg.lang = 'en-US';
      const that = this;
      window.speechSynthesis.onvoiceschanged = function () {
        that.voices = speechSynthesis.getVoices();
        // console.log(that.voices);
        const index = that.findWithAttr(that.voices, 'name' , 'Google UK English Male' );
        if (index !== -1) {
          console.log('Google UK English Male');
          that.msg.voice = that.voices[index];
        } else {
          console.log('default voice');
          that.msg.voice = that.voices[0];
        }
      };
    } catch (err) {
      console.log(err);
    }
    /*
      Listening to direct requests
     */
    dataService.changeEmitted$.subscribe(
      data => {
        console.log('Bot Component Reacting to change');
        // which change was it?
        switch (data.message) {
          case 'directbotrequest':
            this.chatmessage = data.data;
            this.queryBot();
            break;
          default:
            console.log('not for bot component');
        }
      });
  }
  onQuickReply(reply) {
    this.chatmessage = reply;
    this.queryBot();
  }
  onClickRecord() {
    console.log('clickonRecord');
    this.initAnnyang();
  }
  onClickListen() {
    console.log('clickonListen');
    this.initAnnyang();
  }
  sendCommand(val) {
    if(val.length > 0) {
      console.log('executing Voice Commands' + val);
      this._ngZone.run(() => {
        this.chatmessage = val;
        this.queryBot();
      });
    }
  }
  initAnnyang() {
    // test what current speech model is
    if (this.configModel.autorecord) {
      try {
        // Trying to start annyang
        annyang.removeCommands();
        annyang.removeCallback();
        annyang.addCommands(this.commands_listen);
        annyang.addCallback('error', function (err)
        {
          console.log('error in annyang');
          console.log(err);
          if (err.error === 'no-speech') {
            if ( !annyang.isListening() ) {
              annyang.start();
            }
          }
        });
        // Start listening. You can call this here, or attach this call to an event, button, etc.
        annyang.start({ autoRestart: true , continuous: false});
      } catch (err) {
        console.log(err);
      }
    } else {
      if (this.configModel.recording) {
        try {
          // Trying to start annyang
          annyang.removeCommands();
          annyang.removeCallback();
          const that = this;
          annyang.addCallback('end', function(){
            console.log('setting recording back to non record');
            that.configModel.recording = false;
          });
          annyang.addCallback('error', function(){
            console.log('setting recording back to non record cause of error');
            that.configModel.recording = false;
          });
          annyang.addCommands(this.commands_record);
          // Start listening. You can call this here, or attach this call to an event, button, etc.
          annyang.start({ autoRestart: false , continuous: false});
        } catch (err) {
          console.log(err);
        }
      } else {
        // stop everything
        annyang.removeCommands();
        annyang.removeCallback();
        annyang.abort();
      }
    }
  }
  ngOnInit() {
    // this.chatmessage = 'scatterplot';
    // this.queryBot();
    // Let's define our first command. First the text we expect, and then the function it should call
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
    this.showchatlog = true;
    const query = this.chatmessage;
    console.log('enter: ' + query);
    if (query !== '') {
      this.botChat = [];
      this.quickreplies = [];
      this.botChat.push({you:  query});
      this.dataService.postAction('query',{query: query}).subscribe(data => {
        console.log(data);
        this.botChat.push(data);
        // add quick replies
        if (data.bot_response.result.fulfillment) {
          const messages = data.bot_response.result.fulfillment.messages;
          const that = this;
          messages.forEach(function(element) {
            if (element.type === 2) {
              that.quickreplies = element.replies;
            }
          });
        }
        this.chatmessage = '';
        this.dataService.emitChange({
          message: 'botanswer',
          data: data
        });
        if (this.configModel.synthesis) {
          // setup synthesis
          // const voices = window.speechSynthesis.getVoices();
          // console.log('Speech Synthesis');
          // console.log(voices);
          this.msg.text = data.bot_response.result.fulfillment.speech;
          speechSynthesis.speak(this.msg);
        }
        const that = this;
        setTimeout(function(){
          console.log('showing chatlog again');
          that.showchatlog = false;
        }, 3000 );
      });
    }
    /*
    this.store.dispatch({type: 'NEW_MESSAGE', payload: query});
    this.botService.queryBot(query);
    */
  }

  findWithAttr(array, attr, value) {
    for(let i = 0; i < array.length; i += 1) {
      if(array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  }
}
