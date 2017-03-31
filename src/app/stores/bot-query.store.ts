import { BotQueryResponse } from './../models/bot-query-response.model';

export const botQuery = (state: BotQueryResponse = new BotQueryResponse(), {type, payload}) => {
    switch (type) {
        case 'NEW_QUERY':
            return new BotQueryResponse(payload);
        case 'NEW_RESPONSE':
            return payload;
        default:
            return state;
    }
};