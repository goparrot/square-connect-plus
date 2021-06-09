import { ModelError } from 'square-connect';

export interface ISquareException {
    name: string;
    statusCode: number;
    message: string;
    apiError: ModelError;
    retries?: number;
    url?: string;
    method?: string;
    requestArgs?: any;
    errors?: ModelError[];
}
