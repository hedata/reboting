import { Component, NgZone, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';
import annyang from 'annyang';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent implements OnInit {
  public configModel: any = {recording: false, synthesis: false, autorecord: false, userprofile: false};
  public quickreplies = ['Wien', 'Steiermark' , 'Burgenland'
    , 'Kärnten', 'Salzburg', 'Vorarlberg', 'Oberösterreich'
    , 'Niederösterreich', 'Tirol'];
  public context: any;
  userData: any = {};
  botChat = [];
  msg: any;
  showChatLogTime: any;
  showchatlog = false;
  show = false;
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
    private authService: AuthService,
    private _ngZone: NgZone
  ) {
    console.log('in the constructor of bot component');
    /*
      setting base synthesis options
     */
    try {
      this.msg = new SpeechSynthesisUtterance();
      this.msg.volume = 1;							// 0 to 1
      this.msg.rate = 0.8;							// 0.1 to 10
      this.msg.pitch = 0;							// 0 to 2
      this.msg.lang = 'en-US';
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = speechSynthesis.getVoices();
        // console.log(that.voices);
        const index = this.findWithAttr(this.voices, 'name' , 'Google UK English Male' );
        if (index !== -1) {
          console.log('Google UK English Male');
          this.msg.voice = this.voices[index];
        } else {
          console.log('default voice');
          this.msg.voice = this.voices[0];
        }
      };
    } catch (err) {
      console.log('NO SYNTHESIS');
      console.log(err);
    }
    /*
      Listening to direct requests
     */
    dataService.changeEmitted$.subscribe(
      data => {
        // which change was it?
        switch (data.message) {
          case 'directbotrequest':
            console.log('Bot Component direct bot request');
            this.chatmessage = data.data;
            // is a context there 2 ?
            if (data.context) {
              this.context = data.context;
              this.queryBot();
            } else {
              this.queryBot();
            }
            break;
          case 'login':
            this._ngZone.run(() => {
              console.log('Bot Component Login');
              this.userData = data.data;
              this.show = true;
              this.chatmessage = 'show me something';
              this.queryBot();
            });
            break;
          case 'notloggedin':
            this._ngZone.run(() => {
              console.log('Bot Component not logged in');
              this.show = false;
            });
            break;
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
  onClicLogout() {
    this.configModel.userprofile = false;
    this.authService.logout();
  }
  sendCommand(val) {
    if (val.length > 0) {
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
        annyang.addCallback('error', (err) => {
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
          annyang.addCallback('end', () => {
            console.log('setting recording back to non record');
            that.configModel.recording = false;
          });
          annyang.addCallback('error', () => {
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
    console.log('querying BOT');
    console.log('context:');
    console.log(this.context);
    console.log(this.chatmessage);
    this.showchatlog = true;
    // mark this for cange detection
    const query = this.chatmessage;
    if (query !== '') {
      this.botChat = [];
      this.botChat.push({you:  query});
      this.dataService.postAction('query', {query: query, context: this.context}).subscribe(data => {
        console.log(data);
        this.botChat.push(data);
        // add quick replies
        if (data.bot_response.result.fulfillment) {
          const messages = data.bot_response.result.fulfillment.messages;
          messages.forEach((element) => {
            if (element.type === 2) {
              this.quickreplies = element.replies;
              this.quickreplies.push('Show me something');
            }
          });
          // check if we have our special incomplete action
          if (data.bot_response.result.action === 'show_random_visual' && data.bot_response.result.actionIncomplete) {
            this.quickreplies = ['Wien', 'Steiermark' , 'Burgenland' , 'Kärnten', 'Salzburg', 'Vorarlberg',
              'Oberösterreich' , 'Niederösterreich', 'Tirol'];
          }
          // check if we have a context to set
          if(data.bot_context) {
            this.context = data.bot_context;
            console.log('setting context to :');
            console.log(this.context);
          }
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
        // show chatlogtimer
        /*
        this.showChatLogTime = new Date().getTime() / 1000;
        setTimeout(() => {
          // have 7,5 seconds expired since last time the chatlogtime was set?
          if ((new Date().getTime() / 1000) - this.showChatLogTime > 5 ) {
            console.log('hiding chatlog again');
            this.showchatlog = false;
          }
        }, 6000 );
        */
      });
    }
    /*
    this.store.dispatch({type: 'NEW_MESSAGE', payload: query});
    this.botService.queryBot(query);
    */
  }

  Like() {
    this.chatmessage = 'I like it';
    this.queryBot();
  }
  DontLike() {
    this.chatmessage = 'I dont like it';
    this.queryBot();
  }
  findWithAttr(array, attr, value) {
    for (let i = 0; i < array.length; i += 1) {
      if (array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  }
}
