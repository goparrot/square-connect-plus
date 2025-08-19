import { expect } from 'chai';
import {
    Client,
    CustomersApi,
    DEFAULT_CONFIGURATION,
    Environment,
    GiftCardActivitiesApi,
    GiftCardsApi,
    LocationsApi,
    OrdersApi,
    PaymentsApi,
    RefundsApi,
} from 'square/legacy';
import type { ISquareClientConfig } from '../../../src';
import { exponentialDelay, LegacySquareClient, SquareClientFactory } from '../../../src';

describe('SquareClientFactory (unit)', (): void => {
    const accessToken: string = 'test';
    const basePath: string = `${process.env.SQUARE_SANDBOX_BASE_URL || ''}`;

    const config: ISquareClientConfig = {
        retry: {
            maxRetries: 1,
            retryDelay: exponentialDelay,
        },
        configuration: {
            ...DEFAULT_CONFIGURATION,
            timeout: 1000,
            customUrl: basePath,
            environment: Environment.Sandbox,
        },
        logger: console,
        logContext: {
            someKey: 'someValue',
            merchantId: 'unknown',
        },
    };

    describe('#create', (): void => {
        it('should be statically init with accessToken only (default config)', (): void => {
            SquareClientFactory.create(accessToken).should.be.instanceOf(LegacySquareClient);
        });

        it('should be init with accessToken only (default config)', (): void => {
            new SquareClientFactory().create(accessToken).should.be.instanceOf(LegacySquareClient);
        });

        it('should be statically init with accessToken and config', (): void => {
            SquareClientFactory.create(accessToken, config).should.be.instanceOf(LegacySquareClient);
        });

        it('should be init with accessToken and config', (): void => {
            new SquareClientFactory().create(accessToken, config).should.be.instanceOf(LegacySquareClient);
        });
    });

    describe('#createCustomSquareClient', () => {
        it('should be statically init with Test class instance and accessToken (default config)', (): void => {
            class Test extends LegacySquareClient {}
            SquareClientFactory.createCustomSquareClient(Test, accessToken).should.be.instanceOf(Test);
        });

        it('should be init with Test class instance and accessToken only (default config)', (): void => {
            class Test extends LegacySquareClient {}
            new SquareClientFactory().createCustomSquareClient(Test, accessToken).should.be.instanceOf(Test);
        });

        it('should be statically init with with Test class instance and accessToken and config', (): void => {
            class Test extends LegacySquareClient {}
            SquareClientFactory.createCustomSquareClient(Test, accessToken, config).should.be.instanceOf(Test);
        });

        it('should be init with with with Test class instance and accessToken and config', (): void => {
            class Test extends LegacySquareClient {}
            new SquareClientFactory().createCustomSquareClient(Test, accessToken, config).should.be.instanceOf(Test);
        });
    });

    describe('#generateIdempotencyKey', (): void => {
        it('should return string', (): void => {
            LegacySquareClient.generateIdempotencyKey()
                .should.be.match(new RegExp(`\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b`))
                .and.lengthOf(36);
        });
    });

    describe('#getConfig', (): void => {
        it('should return default configuration', (): void => {
            new LegacySquareClient(accessToken).getConfig().should.be.deep.eq({
                retry: {
                    maxRetries: 6,
                    retryDelay: exponentialDelay,
                },
                configuration: DEFAULT_CONFIGURATION,
                logger: undefined,
                logContext: {
                    merchantId: 'unknown',
                },
            });
        });

        it('should return custom configuration', (): void => {
            new LegacySquareClient(accessToken, config).getConfig().should.be.deep.eq(config);
        });
    });

    describe('#getOriginClient', (): void => {
        it('should return Client with default configuration', (): void => {
            const client: Client = new LegacySquareClient(accessToken).getOriginClient();
            // @ts-ignore
            const defaultConfig = client._config;

            client.should.be.instanceOf(Client);
            defaultConfig.should.have.property('timeout', DEFAULT_CONFIGURATION.timeout);
            defaultConfig.should.have.property('squareVersion', DEFAULT_CONFIGURATION.squareVersion);
            defaultConfig.should.have.deep.property('additionalHeaders', DEFAULT_CONFIGURATION.additionalHeaders);
            defaultConfig.should.have.property('environment', DEFAULT_CONFIGURATION.environment);
            defaultConfig.should.have.property('customUrl', DEFAULT_CONFIGURATION.customUrl);
            defaultConfig.should.have.property('accessToken', accessToken);
        });

        it('should return Client with custom configuration', (): void => {
            const client: Client = new LegacySquareClient(accessToken, config).getOriginClient();
            // @ts-ignore
            const defaultConfig = client._config;

            client.should.be.instanceOf(Client);
            defaultConfig.should.have.property('timeout', config.configuration?.timeout);
            defaultConfig.should.have.property('squareVersion', config.configuration?.squareVersion);
            defaultConfig.should.have.deep.property('additionalHeaders', {});
            defaultConfig.should.have.property('environment', config.configuration?.environment);
            defaultConfig.should.have.property('customUrl', config.configuration?.customUrl);
            defaultConfig.should.have.property('accessToken', accessToken);
        });

        it('should return the same object on second call', (): void => {
            const squareClient: LegacySquareClient = new LegacySquareClient(accessToken);
            squareClient.getOriginClient().should.be.deep.eq(squareClient.getOriginClient());
        });
    });

    describe('#getLocationsApi', (): void => {
        it('should return LocationsApi', (): void => {
            expect(new LegacySquareClient(accessToken).getLocationsApi()).to.be.instanceOf(LocationsApi);
        });
    });

    describe('#getCustomersApi', (): void => {
        it('should return CustomersApi', (): void => {
            expect(new LegacySquareClient(accessToken).getCustomersApi()).to.be.an.instanceof(CustomersApi);
        });
    });

    describe('#getPaymentsApi', (): void => {
        it('should return PaymentsApi', (): void => {
            expect(new LegacySquareClient(accessToken).getPaymentsApi()).to.be.instanceOf(PaymentsApi);
        });
    });

    describe('#getGiftCardsApi', (): void => {
        it('should return GiftCardsApi', (): void => {
            expect(new LegacySquareClient(accessToken).getGiftCardsApi()).to.be.instanceOf(GiftCardsApi);
        });
    });

    describe('#getGiftCardActivitiesApi', (): void => {
        it('should return GiftCardActivitiesApi', (): void => {
            expect(new LegacySquareClient(accessToken).getGiftCardActivitiesApi()).to.be.instanceOf(GiftCardActivitiesApi);
        });
    });

    describe('#getRefundsApi', (): void => {
        it('should return RefundsApi', (): void => {
            expect(new LegacySquareClient(accessToken).getRefundsApi()).to.be.instanceOf(RefundsApi);
        });
    });

    describe('#getOrdersApi', (): void => {
        it('should return OrdersApi', (): void => {
            expect(new LegacySquareClient(accessToken).getOrdersApi()).to.be.instanceOf(OrdersApi);
        });
    });
});
