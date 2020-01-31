import { retryableErrorCodes } from '../constants';
import { SquareException } from '../exception';
import { sleep } from './common.utils';

export interface IRetriesOptions {
    /** @default 3 */
    maxRetries: number;
    /** @default exponentialDelay */
    retryDelay: (retryCount: number) => number;
    retryCondition: (error: SquareException, maxRetries: number, retries: number) => Promise<boolean>;
}

/**
 * @return {number} - delay in milliseconds
 */
export function exponentialDelay(retryNumber: number): number {
    const delay: number = Math.pow(2, retryNumber) * 100;
    const randomSum: number = delay * 0.2 * Math.random(); // 0-20% of the delay

    return delay + randomSum;
}

/**
 * add the ability to retry the request
 */
export async function makeRetryable(promiseFn: (...arg: any[]) => Promise<any>, params: IRetriesOptions): Promise<any> {
    let retries: number = 0;

    async function retry(): Promise<any> {
        try {
            return await promiseFn();
        } catch (error) {
            const squareException: SquareException = SquareException.createFromSuperAgentError(error, retries);

            if (await params.retryCondition(squareException, params.maxRetries, retries)) {
                retries++;
                const delay: number = exponentialDelay(retries);
                await sleep(delay);

                return retry();
            }

            throw squareException;
        }
    }

    return retry();
}

export function isRetryableException(error: Error): boolean {
    if (!(error instanceof SquareException)) {
        return false;
    }

    const isRetryableResponseStatusCode: boolean = 429 === error.statusCode || (error.statusCode >= 500 && 501 !== error.statusCode);
    const isIdempotentRequestMethod: boolean = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'].includes(error.method?.toUpperCase() || '');

    return isRetryableResponseStatusCode && (isIdempotentRequestMethod || retryableErrorCodes.includes(error.apiError.code));
}

export async function retryCondition(error: SquareException, maxRetries: number, retries: number): Promise<boolean> {
    if (isRetryableException(error) && maxRetries > retries) {
        return true;
    }

    throw error;
}
