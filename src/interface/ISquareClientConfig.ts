import type { Configuration } from 'square';
import type { ILogger } from '../logger';
import type { IRetriesOptions } from './IRetriesOptions';

export interface ISquareClientConfig {
    retry?: Partial<IRetriesOptions>;
    configuration?: Partial<Omit<Configuration, 'accessToken'>>;
    logger?: ILogger;
}
