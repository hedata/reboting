export class BotQueryResponse {
    query: string;
    speech: string;

    constructor(query?: string, speech?: string) {
        this.query = query || '';
        this.speech = speech || '';
    }
};
