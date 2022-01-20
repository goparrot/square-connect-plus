import { SquareApiException } from '../exception';

export function isSquareApiException(error: Error | unknown): error is SquareApiException {
    return error instanceof SquareApiException;
}
