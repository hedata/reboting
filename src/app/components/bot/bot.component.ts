import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import { DataService } from '../../services/data.service';
import annyang from 'annyang';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent implements OnInit {
  public configModel: any = {recording: false, synthesis: true, autorecord: false, quickreplies: false, userprofile: false};
  public quickreplies = ['Show me what you got'];
  botChat = [];
  msg = new SpeechSynthesisUtterance();
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
    private _ngZone: NgZone,
    private ref: ChangeDetectorRef
  ) {
    /*
      setting base synthesis options
     */
    try {
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
            console.log('Bot Component Reacting to change');
            this.chatmessage = data.data;
            this.queryBot();
            break;
          case 'login':
            this._ngZone.run(() => {
              console.log('Bot Component Reacting to login');
              this.show = true;
              this.chatmessage = 'show me what you got';
              this.queryBot();
            });
            break;
          default:
            console.log('not for bot component');
        }
      });
  }
  onQuickReply(reply) {
    this.configModel.quickreplies = false;
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
        annyang.addCallback('error', (err) =>
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
    this.showchatlog = true;
    // mark this for cange detection
    const query = this.chatmessage;
    console.log('enter: ' + query);
    if (query !== '') {
      this.botChat = [];
      this.botChat.push({you:  query});
      this.dataService.postAction('query',{query: query}).subscribe(data => {
        console.log(data);
        this.botChat.push(data);
        // add quick replies
        if (data.bot_response.result.fulfillment) {
          const messages = data.bot_response.result.fulfillment.messages;
          messages.forEach((element) => {
            if (element.type === 2) {
              this.quickreplies = element.replies;
              this.quickreplies.push('Show me what you got');
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
        setTimeout(() => {
          console.log('showing chatlog again');
          this.showchatlog = false;
        }, 5000 );
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
