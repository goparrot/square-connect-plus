import { ApiError } from 'square';
import { SquareApiException } from '../../../src';

describe('SquareApiException (unit)', (): void => {
    const errors = [
        {
            category: 'RATE_LIMIT_ERROR',
            code: 'RATE_LIMITED',
            detail: 'fake 429 error',
        },
    ];
    const response = {
        statusCode: 400,
        headers: {
            'user-agent': 'Square-TypeScript-SDK/17.0.0',
            'Content-Type': 'application/json',
            'Square-Version': '2021-12-15',
            authorization: 'Bearer EAAAEDFfyeoo0XgXi-Dd7ofp_3W6eAcjHMClC3GlQR61xATqdVixe6v4kq21KgnL',
            accept: 'application/json',
        },
        body: JSON.stringify({ errors }),
    };

    const apiError: ApiError = new ApiError(
        {
            response,
            request: {
                method: 'POST',
                url: 'https://connect.squareupsandbox.com/v2/customers/search',
            },
        },
        '',
    );
    describe('#constructor', (): void => {
        it('should be ok with apiError', () => {
            const squareException: SquareApiException = new SquareApiException(apiError, 0);

            squareException.should.be.instanceOf(SquareApiException);
            squareException.should.have.property('statusCode', 400);
            squareException.should.have.property('apiError', apiError);
            squareException.should.have.property('retries', 0);
            squareException.should.have.property('url', apiError.request.url);
            squareException.should.have.property('method', apiError.request?.method);
            squareException.should.have.property('errors', apiError.errors);
            squareException.should.have.property('message', errors?.[0]?.detail);
        });

        it('should be ok with empty data.originError object', (): void => {
            // @ts-ignore
            const squareException: SquareApiException = new SquareApiException({});

            squareException.should.be.instanceOf(SquareApiException);
            squareException.should.have.property('statusCode', 500);
            squareException.should.have.property('retries', 0);
            squareException.should.have.property('errors').eql([]);
            squareException.should.have.property('message', 'Square API error');
        });

        it('should be ok with Error', (): void => {
            const error = new Error('error message');
            // @ts-ignore
            const squareException: SquareApiException = new SquareApiException(error);

            squareException.should.be.instanceOf(SquareApiException);
            squareException.should.have.property('statusCode', 500);
            squareException.should.have.property('retries', 0);
            squareException.should.have.property('errors').eql([]);
            squareException.should.have.property('message', 'error message');
        });
    });

    describe('#toObject', (): void => {
        it('should be ok with apiError', () => {
            const squareException: SquareApiException = new SquareApiException(apiError, 0);

            const plainObject = squareException.toObject();

            plainObject.should.have.property('statusCode', 400);
            plainObject.should.have.property('apiError', apiError);
            plainObject.should.have.property('retries', 0);
            plainObject.should.have.property('url', apiError.request.url);
            plainObject.should.have.property('method', apiError.request?.method);
            plainObject.should.have.property('errors', apiError.errors);
            plainObject.should.have.property('message', errors?.[0]?.detail);
        });

        it('should be ok with empty data.originError object', (): void => {
            // @ts-ignore
            const squareException: SquareApiException = new SquareApiException({});

            const plainObject = squareException.toObject();

            plainObject.should.have.property('statusCode', 500);
            plainObject.should.have.property('retries', 0);
            plainObject.should.have.property('url').eql(undefined);
            plainObject.should.have.property('method').eql(undefined);
            plainObject.should.have.property('errors').eql([]);
            plainObject.should.have.property('message', 'Square API error');
        });

        it('should be ok with Error', (): void => {
            const error = new Error('error message');
            // @ts-ignore
            const squareException: SquareApiException = new SquareApiException(error);

            const plainObject = squareException.toObject();

            plainObject.should.have.property('statusCode', 500);
            plainObject.should.have.property('retries', 0);
            plainObject.should.have.property('errors').eql([]);
            plainObject.should.have.property('message', 'error message');
        });
    });

    describe('#toString', (): void => {
        it('should be ok with apiError', () => {
            const squareException: SquareApiException = new SquareApiException(apiError, 0);

            const plainObject = squareException.toString();

            plainObject.should.deep.equal(JSON.stringify(squareException.toObject()));
        });

        it('should be ok with empty data.originError object', (): void => {
            // @ts-ignore
            const squareException: SquareApiException = new SquareApiException({});
            const plainObject = squareException.toString();

            plainObject.should.deep.equal(JSON.stringify(squareException.toObject()));
        });

        it('should be ok with Error', (): void => {
            const error = new Error('error message');
            // @ts-ignore
            const squareException: SquareApiException = new SquareApiException(error);

            const plainObject = squareException.toString();

            plainObject.should.deep.equal(JSON.stringify(squareException.toObject()));
        });
    });
});
