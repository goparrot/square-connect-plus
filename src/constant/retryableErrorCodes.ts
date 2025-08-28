export const retryableErrorCodes: ReadonlyArray<string> = Object.freeze([
    'RATE_LIMITED',
    'REQUEST_TIMEOUT',
    'GATEWAY_TIMEOUT',
    'SERVICE_UNAVAILABLE',
    'INTERNAL_SERVER_ERROR',
]);
