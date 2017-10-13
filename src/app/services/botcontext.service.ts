import {Injectable} from '@angular/core';

@Injectable()
export class BotContextService {
  private bot_context: any;
  constructor() {
    console.log('in the Constructor of the Bot Context Service');
  }
  public getBotContext() {
    return this.bot_context;
  }
  public setBotContext(bot_context: any) {
    this.bot_context = bot_context;
  }
}
