import nock from 'nock';
import { SquareClient } from '../../../src/client';
import { SquareException } from '../../../src/exception';
import { ISquareClientConfig } from '../../../src/interface';
import { exponentialDelay } from '../../../src/utils';

describe('SquareClient (e2e)', (): void => {
    const accessToken: string = 'test';
    const basePath: string = `${process.env.SQUARE_SANDBOX_BASE_URL}`;

    const config: ISquareClientConfig = {
        retry: {
            maxRetries: 2,
            retryDelay: exponentialDelay,
        },
        originClient: {
            timeout: 100,
            cache: false,
            enableCookies: false,
            basePath,
        },
    };

    afterEach((): void => {
        nock.cleanAll();
    });

    it('should NOT retry 501 http status', async (): Promise<any> => {
        nock(basePath).get(/.*/).times(1000).reply(501);

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareException)
            .and.have.property('retries', 0);
    });

    it('should NOT retry 400 http status', async (): Promise<any> => {
        nock(basePath).get(/.*/).times(1000).reply(400);

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareException)
            .and.have.property('retries', 0);
    });

    it('should retry 429 http status', async (): Promise<any> => {
        nock(basePath)
            .get(/.*/)
            .times(1000)
            .reply(429, {
                errors: [
                    {
                        category: 'RATE_LIMIT_ERROR',
                        code: 'RATE_LIMITED',
                        detail: 'fake 429 error',
                    },
                ],
            });

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareException, 'fake 429 error')
            .and.have.property('retries', config.retry?.maxRetries);
    });

    it('should retry 500 http status', async (): Promise<any> => {
        nock(basePath).get(/.*/).times(1000).reply(500);

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareException)
            .and.have.property('retries', config.retry?.maxRetries);
    });

    it('should retry 503 http status', async (): Promise<any> => {
        nock(basePath).get(/.*/).times(1000).reply(503);

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareException)
            .and.have.property('retries', config.retry?.maxRetries);
    });

    it('should retry if request timeout', async (): Promise<any> => {
        nock(basePath)
            .get(/.*/)
            .times(1000)
            .delay({
                head: 3000,
            })
            .reply(200, 'OK');

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareException, 'Square API timeout')
            .and.have.property('retries', config.retry?.maxRetries);
    });
});
