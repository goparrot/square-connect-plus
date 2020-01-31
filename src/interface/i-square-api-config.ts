import { ILogger } from '../logger';
import { IRetriesOptions } from '../utils';

export interface ISquareClientConfig {
    retry?: Partial<IRetriesOptions>;
    originClient?: {
        /**
         * The base URL against which to resolve every API call's (relative) path.
         */
        basePath?: string;

        /**
         * The default HTTP headers to be included for all API calls.
         */
        defaultHeaders?: { [key: string]: string };

        /**
         *  The default HTTP timeout for all API calls.
         */
        timeout?: number;

        /**
         * If set to false an additional timestamp parameter is added to all API GET calls to prevent browser caching.
         */
        cache?: boolean;

        /**
         * If set to true, the client will save the cookies from each server response, and return them in the next request.
         */
        enableCookies?: boolean;
    };
    logger?: ILogger;
}
