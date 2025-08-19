import type { Error as SquareError } from 'square/legacy';
import { retryableErrorCodes } from '../constants';
import type { SquareApiException } from '../exception';

export function isRetryableSquareApiException(error: SquareApiException): boolean {
    const squareError: SquareError | undefined = error.errors?.[0];

    if (squareError) {
        return retryableErrorCodes.includes(squareError.code);
    }

    return [408, 429].includes(error.statusCode) || (error.statusCode >= 500 && error.statusCode <= 599 && error.statusCode !== 501);
}
