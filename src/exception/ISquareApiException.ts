import type { ApiError, Error } from 'square';

export interface ISquareApiException {
    retries: number;
    name: string;
    message: string;
    statusCode: number;
    errors: Error[];
    apiError?: ApiError;
    url?: string;
    method?: string;
    responseTime?: number;
}
