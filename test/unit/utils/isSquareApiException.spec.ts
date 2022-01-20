import { ApiError } from 'square';
import { isSquareApiException, SquareApiException } from '../../../src';

describe('isSquareApiException', () => {
    it('should return true', () => {
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
        isSquareApiException(new SquareApiException(apiError, 0)).should.equal(true);
    });

    it('should return false', () => {
        // @ts-ignore
        isSquareApiException(new ApiError({ request: {}, response: {} })).should.equal(false);
    });

    it('should return false (unknown)', () => {
        const error: unknown = undefined;
        isSquareApiException(error).should.equal(false);
    });
});
