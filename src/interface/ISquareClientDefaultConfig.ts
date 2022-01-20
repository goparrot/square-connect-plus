import type { ISquareClientConfig } from './ISquareClientConfig';
import type { ISquareClientDefaultRetryConfig } from './ISquareClientDefaultRetryConfig';

export interface ISquareClientDefaultConfig extends ISquareClientConfig {
    retry: ISquareClientDefaultRetryConfig;
}
