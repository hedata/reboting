import { Response } from './response.model';

export interface AppStore {
    uploadState: boolean;
    response: Response;
};
