import { expect } from 'chai';
import nock, { cleanAll } from 'nock';
import { DEFAULT_CONFIGURATION, Environment } from 'square';
import type { ISquareClientConfig } from '../../../src';
import { SquareClient, SquareApiException, exponentialDelay } from '../../../src';

describe('SquareClient (e2e)', (): void => {
    const accessToken: string = 'test';
    const customUrl: string = `${process.env.SQUARE_SANDBOX_BASE_URL || ''}`;

    const config: ISquareClientConfig = {
        retry: {
            maxRetries: 2,
            retryDelay: exponentialDelay,
        },
        configuration: {
            ...DEFAULT_CONFIGURATION,
            environment: Environment.Sandbox,
            timeout: 100,
            customUrl,
        },
    };

    afterEach((): void => {
        cleanAll();
    });

    it('should NOT retry 501 http status', async (): Promise<unknown> => {
        nock(customUrl).get(/.*/).times(1000).reply(501);

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareApiException)
            .and.have.property('retries', 0);
    });

    it('should NOT retry 400 http status', async (): Promise<unknown> => {
        nock(customUrl).get(/.*/).times(1000).reply(400);

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareApiException)
            .and.have.property('retries', 0);
    });

    it('should retry 429 http status', async (): Promise<unknown> => {
        nock(customUrl)
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
            .should.eventually.be.rejectedWith(SquareApiException, 'fake 429 error')
            .and.have.property('retries', config.retry?.maxRetries);
    });

    it('should retry 500 http status', async (): Promise<unknown> => {
        nock(customUrl).get(/.*/).times(1000).reply(500);

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareApiException)
            .and.have.property('retries', config.retry?.maxRetries);
    });

    it('should retry 503 http status', async (): Promise<unknown> => {
        nock(customUrl).get(/.*/).times(1000).reply(503);

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareApiException)
            .and.have.property('retries', config.retry?.maxRetries);
    });

    it('should retry if request timeout', async (): Promise<unknown> => {
        nock(customUrl)
            .get(/.*/)
            .times(1000)
            .delay({
                head: 3000,
            })
            .reply(200, 'OK');

        return new SquareClient(accessToken, config)
            .getLocationsApi()
            .listLocations()
            .should.eventually.be.rejectedWith(SquareApiException, 'timeout of 100ms exceeded')
            .and.have.property('retries', config.retry?.maxRetries);
    });

    it('should retry 500 http method POST', async (): Promise<unknown> => {
        nock(customUrl).post(/.*/).times(1000).reply(503);

        return new SquareClient(accessToken, config)
            .getCustomersApi()
            .searchCustomers({})
            .should.eventually.be.rejectedWith(SquareApiException)
            .and.have.property('retries', config.retry?.maxRetries);
    });

    it('should NOT retry 400 http method POST', async (): Promise<unknown> => {
        nock(customUrl).post(/.*/).times(1000).reply(400);

        return new SquareClient(accessToken, config)
            .getCustomersApi()
            .searchCustomers({})
            .should.eventually.be.rejectedWith(SquareApiException)
            .and.have.property('retries', 0);
    });

    it('should NOT retry if in retry config maxRetries is equal with zero', async (): Promise<unknown> => {
        nock(customUrl).post(/.*/).times(1000).reply(400);

        return new SquareClient(accessToken, { ...config, retry: { maxRetries: 0 } })
            .getCustomersApi()
            .searchCustomers({})
            .should.eventually.be.rejectedWith(SquareApiException)
            .and.have.property('retries', 0);
    });
    it('should NOT retry if in retry config retryCondition \n return false', async (): Promise<unknown> => {
        nock(customUrl).post(/.*/).times(1000).reply(400);

        return new SquareClient(accessToken, { ...config, retry: { maxRetries: 0, retryCondition: async (): Promise<boolean> => false } })
            .getCustomersApi()
            .searchCustomers({})
            .should.eventually.be.rejectedWith(SquareApiException)
            .and.have.property('retries', 0);
    });

    it('should NOT retry 200', async (): Promise<unknown> => {
        nock(customUrl).post(/.*/, {}).times(DEFAULT_CONFIGURATION.timeout).reply(200, { id: 123 });

        return new SquareClient(accessToken, { ...config, configuration: { ...config.configuration, timeout: DEFAULT_CONFIGURATION.timeout } })
            .getCustomersApi()
            .searchCustomers({})
            .then((response) => {
                response.should.have.property('body', JSON.stringify({ id: 123 }));
            })
            .catch(() => {
                expect(true).equal(false);
            });
    });
});
