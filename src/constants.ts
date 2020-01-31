import { ErrorCodeType } from 'square-connect';

export const retryableErrorCodes: ReadonlyArray<ErrorCodeType> = Object.freeze([
    'RATE_LIMITED',
    'REQUEST_TIMEOUT',
    'GATEWAY_TIMEOUT',
    'SERVICE_UNAVAILABLE',
    'INTERNAL_SERVER_ERROR',
]);
