import { IRetriesOptions } from '../utils';

export interface ISquareClientDefaultRetryConfig extends Partial<IRetriesOptions> {
    maxRetries: number;
    retryDelay: (retryCount: number) => number;
}
