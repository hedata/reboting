export class AiMessage {
    message: string;
    imageUrl: string;
    quickReply: any;

    constructor (response: any[]) {
        for (let i = 0; i < response.length; i++) {
            switch (response[i].type) {
                case 0:
                    this.message = response[i].speech;
                    break;
                case 3:
                    this.imageUrl = response[i].imageUrl;
                    break;
                case 2:
                    this.quickReply.title = response[i].title;
                    this.quickReply.replies = response[i].replies;
                    break;
                default:
                    break;
            }
        }
    }
}