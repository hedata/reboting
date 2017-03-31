import { BotQueryResponse } from './../models/bot-query-response.model';

export const botQuery = (state: string[] = [], {type, payload}) => {
    switch (type) {
        case 'NEW_MESSAGE':
            return [...state, payload];
        default:
            return state;
    }
};