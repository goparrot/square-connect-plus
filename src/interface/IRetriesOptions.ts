export interface IRetriesOptions {
    /** @default 3 */
    maxRetries: number;
    /** @default exponentialDelay */
    retryDelay: (retryCount: number) => number;
    retryCondition: (error: Error, maxRetries: number, retries: number) => Promise<boolean>;
}
