export class Response {
    action: {
        payload: any;
        status: string;
    };
    bot_response: any;

    constructor (action?: any, bot_response?: any) {
        this.action = action || {};
        this.bot_response = bot_response || {};
    }
}