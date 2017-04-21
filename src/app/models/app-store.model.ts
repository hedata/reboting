import { Response } from './response.model';
import { BotQueryResponse } from './bot-query-response.model';

export interface AppStore {
    uploadState: boolean;
    response: Response;
    botQuery: string[];
    visual: any;
};
