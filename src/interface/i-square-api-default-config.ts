import { ISquareClientConfig } from './i-square-api-config';
import { ISquareClientDefaultRetryConfig } from './i-square-api-default-retry-config';

export interface ISquareClientDefaultConfig extends ISquareClientConfig {
    retry: ISquareClientDefaultRetryConfig;
    originClient: {
        timeout: number;
    };
}
