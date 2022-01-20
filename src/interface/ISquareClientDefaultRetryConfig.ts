import type { IRetriesOptions } from './IRetriesOptions';

export interface ISquareClientDefaultRetryConfig extends Partial<IRetriesOptions> {
    maxRetries: number;
    retryDelay: (retryCount: number) => number;
}
