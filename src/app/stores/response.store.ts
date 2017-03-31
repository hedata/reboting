import { Response } from './../models/response.model';

export const response = (state: Response = new Response(), {type, payload}) => {
    switch (type) {
        case 'NEW_RESPONSE':
            return payload;
        default:
            return state;
    }
};
