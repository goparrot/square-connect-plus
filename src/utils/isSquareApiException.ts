import { SquareApiException } from '../exception';

export function isSquareApiException(error: unknown): error is SquareApiException {
    return error instanceof SquareApiException;
}
