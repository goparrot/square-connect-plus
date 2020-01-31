import { SquareException } from '../../../src/exception';

class SuperAgentError extends Error {
    constructor(message: string, readonly response?: any, readonly code?: string) {
        super(message);
    }
}

describe('SquareException (unit)', (): void => {
    describe('#createFromSuperAgentError', (): void => {
        it('should be ok without args', async (): Promise<any> => {
            const squareException: SquareException = new SquareException();

            squareException.should.be.instanceOf(SquareException);
            squareException.should.have.property('message', 'Square API error');
            squareException.should.have.property('retries', 0);
            squareException.should.have.property('statusCode', 500);
            return squareException.should.have.property('apiError').and.eql({ category: 'API_ERROR', code: 'SERVICE_UNAVAILABLE', detail: 'Square API error' });
        });
    });

    describe('#createFromSuperAgentError', (): void => {
        it('should be ok with Error', async (): Promise<any> => {
            const error: Error = new Error('test message');
            const squareException: SquareException = SquareException.createFromSuperAgentError(error, 0);

            squareException.should.be.instanceOf(SquareException);
            squareException.should.have.property('message', 'Square API error');
            squareException.should.have.property('retries', 0);
            squareException.should.have.property('statusCode', 500);
            return squareException.should.have.property('apiError').and.eql({ category: 'API_ERROR', code: 'SERVICE_UNAVAILABLE', detail: 'Square API error' });
        });

        it('should be ok with Error with ECONNABORTED error code', async (): Promise<any> => {
            const error: SuperAgentError = new SuperAgentError('test message', undefined, 'ECONNABORTED');

            const squareException: SquareException = SquareException.createFromSuperAgentError(error, 1);

            squareException.should.be.instanceOf(SquareException);
            squareException.should.have.property('message', 'Square API timeout');
            squareException.should.have.property('retries', 1);
            squareException.should.have.property('statusCode', 500);
            squareException.should.have.property('url', undefined);
            squareException.should.have.property('method', undefined);
            return squareException.should.have.property('apiError').and.eql({
                category: 'API_ERROR',
                code: 'GATEWAY_TIMEOUT',
                detail: 'Square API timeout',
            });
        });

        it('should be ok with Error with empty response object', async (): Promise<any> => {
            const error: SuperAgentError = new SuperAgentError('test message', {});

            const squareException: SquareException = SquareException.createFromSuperAgentError(error, 1);

            squareException.should.be.instanceOf(SquareException);
            squareException.should.have.property('message', 'Square API error');
            squareException.should.have.property('retries', 1);
            squareException.should.have.property('statusCode', 500);
            squareException.should.have.property('url', undefined);
            squareException.should.have.property('method', undefined);
            return squareException.should.have.property('apiError').and.eql({
                category: 'API_ERROR',
                code: 'SERVICE_UNAVAILABLE',
                detail: 'Square API error',
            });
        });

        it('should be ok with Error with response status', async (): Promise<any> => {
            const error: SuperAgentError = new SuperAgentError('test message', {
                status: 429,
            });

            const squareException: SquareException = SquareException.createFromSuperAgentError(error, 1);

            squareException.should.be.instanceOf(SquareException);
            squareException.should.have.property('message', 'Square API error');
            squareException.should.have.property('retries', 1);
            squareException.should.have.property('statusCode', 429);
            squareException.should.have.property('url', undefined);
            squareException.should.have.property('method', undefined);
            return squareException.should.have.property('apiError').and.eql({
                category: 'API_ERROR',
                code: 'SERVICE_UNAVAILABLE',
                detail: 'Square API error',
            });
        });

        it('should be ok with Error with response body', async (): Promise<any> => {
            const error: SuperAgentError = new SuperAgentError('test message', {
                status: 429,
                body: {},
            });

            const squareException: SquareException = SquareException.createFromSuperAgentError(error, 1);

            squareException.should.be.instanceOf(SquareException);
            squareException.should.have.property('message', 'Square API error');
            squareException.should.have.property('retries', 1);
            squareException.should.have.property('statusCode', 429);
            squareException.should.have.property('url', undefined);
            squareException.should.have.property('method', undefined);
            return squareException.should.have.property('apiError').and.eql({
                category: 'API_ERROR',
                code: 'SERVICE_UNAVAILABLE',
                detail: 'Square API error',
            });
        });

        it('should be ok with Error with response body.errors', async (): Promise<any> => {
            const error: SuperAgentError = new SuperAgentError('test message', {
                status: 429,
                body: {
                    errors: [
                        {
                            category: 'RATE_LIMIT_ERROR',
                            code: 'RATE_LIMITED',
                            detail: 'fake 429 error',
                        },
                    ],
                },
            });

            const squareException: SquareException = SquareException.createFromSuperAgentError(error, 1);

            squareException.should.be.instanceOf(SquareException);
            squareException.should.have.property('message', 'fake 429 error');
            squareException.should.have.property('retries', 1);
            squareException.should.have.property('statusCode', 429);
            squareException.should.have.property('url', undefined);
            squareException.should.have.property('method', undefined);
            return squareException.should.have.property('apiError').and.eql({
                category: 'RATE_LIMIT_ERROR',
                code: 'RATE_LIMITED',
                detail: 'fake 429 error',
            });
        });

        it('should be ok with Error + response and request properties ', async (): Promise<any> => {
            const error: SuperAgentError = new SuperAgentError('test message', {
                status: 429,
                body: {
                    errors: [
                        {
                            category: 'RATE_LIMIT_ERROR',
                            code: 'RATE_LIMITED',
                            detail: 'fake 429 error',
                        },
                    ],
                },
                request: {
                    url: 'url',
                    method: 'get',
                },
            });

            const squareException: SquareException = SquareException.createFromSuperAgentError(error, 1);

            squareException.should.be.instanceOf(SquareException);
            squareException.should.have.property('message', 'fake 429 error');
            squareException.should.have.property('retries', 1);
            squareException.should.have.property('statusCode', 429);
            squareException.should.have.property('url', 'url');
            squareException.should.have.property('method', 'GET');
            return squareException.should.have.property('apiError').and.eql({
                category: 'RATE_LIMIT_ERROR',
                code: 'RATE_LIMITED',
                detail: 'fake 429 error',
            });
        });
    });
});
