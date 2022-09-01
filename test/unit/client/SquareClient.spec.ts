import { expect } from 'chai';
import {
    Client,
    Environment,
    ApplePayApi,
    CatalogApi,
    CheckoutApi,
    CustomersApi,
    EmployeesApi,
    InventoryApi,
    LaborApi,
    LocationsApi,
    MobileAuthorizationApi,
    OAuthApi,
    OrdersApi,
    PaymentsApi,
    RefundsApi,
    TransactionsApi,
    DEFAULT_CONFIGURATION,
    CardsApi,
    LoyaltyApi,
    InvoicesApi,
} from 'square';
import { describe } from 'mocha';
import type { ISquareClientConfig } from '../../../src';
import { SquareClient, exponentialDelay } from '../../../src';

describe('SquareClient (unit)', (): void => {
    const accessToken: string = 'test';
    const basePath: string = `${process.env.SQUARE_SANDBOX_BASE_URL || ''}`;

    const config: ISquareClientConfig = {
        retry: {
            maxRetries: 1,
            retryDelay: exponentialDelay,
        },
        configuration: {
            ...DEFAULT_CONFIGURATION,
            customUrl: basePath,
            environment: Environment.Sandbox,
        },
        logger: console,
    };

    describe('#constructor', (): void => {
        it('should be init with accessToken only (default config)', (): void => {
            new SquareClient(accessToken).should.be.instanceOf(SquareClient);
        });

        it('should be init with accessToken and config', (): void => {
            new SquareClient(accessToken, config).should.be.instanceOf(SquareClient);
        });
    });

    describe('#generateIdempotencyKey', (): void => {
        it('should return string', (): void => {
            SquareClient.generateIdempotencyKey()
                .should.be.match(new RegExp(`\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b`))
                .and.lengthOf(36);
        });
    });

    describe('#getConfig', (): void => {
        it('should return default configuration', (): void => {
            new SquareClient(accessToken).getConfig().should.be.deep.eq({
                retry: {
                    maxRetries: 6,
                    retryDelay: exponentialDelay,
                },
                configuration: {
                    ...DEFAULT_CONFIGURATION,
                },
                logger: undefined,
            });
        });

        it('should return custom configuration', (): void => {
            new SquareClient(accessToken, config).getConfig().should.be.deep.eq(config);
        });
    });

    describe('#getOriginClient', (): void => {
        it('should return Client with default configuration', (): void => {
            const client: Client = new SquareClient(accessToken).getOriginClient();
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
            const client: Client = new SquareClient(accessToken, config).getOriginClient();
            // @ts-ignore
            const defaultConfig = client._config;

            client.should.be.instanceOf(Client);
            defaultConfig.should.have.property('timeout', config.configuration?.timeout);
            defaultConfig.should.have.deep.property('additionalHeaders', {});
            defaultConfig.should.and.have.property('environment', config.configuration?.environment);
            defaultConfig.should.have.property('customUrl', config.configuration?.customUrl);
        });

        it('should return the same object on second call', (): void => {
            const squareClient: SquareClient = new SquareClient(accessToken);
            squareClient.getOriginClient().should.be.deep.eq(squareClient.getOriginClient());
        });
    });

    describe('#getApplePayApi', (): void => {
        it('should return ApplePayApi', (): void => {
            expect(new SquareClient(accessToken).getApplePayApi()).to.be.instanceOf(ApplePayApi);
        });
    });

    describe('#getCatalogApi', (): void => {
        it('should return CatalogApi', (): void => {
            expect(new SquareClient(accessToken).getCatalogApi()).to.be.instanceOf(CatalogApi);
        });
    });

    describe('#getCheckoutApi', (): void => {
        it('should return CheckoutApi', (): void => {
            expect(new SquareClient(accessToken).getCheckoutApi()).to.be.instanceOf(CheckoutApi);
        });
    });

    describe('#getCustomersApi', (): void => {
        it('should return CustomersApi', (): void => {
            expect(new SquareClient(accessToken).getCustomersApi()).to.be.instanceOf(CustomersApi);
        });
    });

    describe('#getLoyaltyApi', (): void => {
        it('should return LoyaltyApi', (): void => {
            expect(new SquareClient(accessToken).getLoyaltyApi()).to.be.instanceOf(LoyaltyApi);
        });
    });

    describe('#getEmployeesApi', (): void => {
        it('should return EmployeesApi', (): void => {
            expect(new SquareClient(accessToken).getEmployeesApi()).to.be.instanceOf(EmployeesApi);
        });
    });

    describe('#getInventoryApi', (): void => {
        it('should return InventoryApi', (): void => {
            expect(new SquareClient(accessToken).getInventoryApi()).to.be.instanceOf(InventoryApi);
        });
    });

    describe('#getLaborApi', (): void => {
        it('should return LaborApi', (): void => {
            expect(new SquareClient(accessToken).getLaborApi()).to.be.instanceOf(LaborApi);
        });
    });

    describe('#getLocationsApi', (): void => {
        it('should return LocationsApi', (): void => {
            expect(new SquareClient(accessToken).getLocationsApi()).to.be.instanceOf(LocationsApi);
        });
    });

    describe('#getMobileAuthorizationApi', (): void => {
        it('should return MobileAuthorizationApi', (): void => {
            expect(new SquareClient(accessToken).getMobileAuthorizationApi()).to.be.instanceOf(MobileAuthorizationApi);
        });
    });

    describe('#getOAuthApi', (): void => {
        it('should return OAuthApi', (): void => {
            expect(new SquareClient(accessToken).getOAuthApi()).to.be.instanceOf(OAuthApi);
        });
    });

    describe('#getOrdersApi', (): void => {
        it('should return OrdersApi', (): void => {
            expect(new SquareClient(accessToken).getOrdersApi()).to.be.instanceOf(OrdersApi);
        });
    });

    describe('#getPaymentsApi', (): void => {
        it('should return PaymentsApi', (): void => {
            expect(new SquareClient(accessToken).getPaymentsApi()).to.be.instanceOf(PaymentsApi);
        });
    });

    describe('#getRefundsApi', (): void => {
        it('should return RefundsApi', (): void => {
            expect(new SquareClient(accessToken).getRefundsApi()).to.be.instanceOf(RefundsApi);
        });
    });

    describe('#getTransactionsApi', (): void => {
        it('should return TransactionsApi', (): void => {
            expect(new SquareClient(accessToken).getTransactionsApi()).to.be.instanceOf(TransactionsApi);
        });
    });

    describe('#getCardsApi', (): void => {
        it('should return CardsApi', (): void => {
            expect(new SquareClient(accessToken).getCardsApi()).to.be.instanceOf(CardsApi);
        });
    });

    describe('getInvoiceApi', (): void => {
        it('should return getInvoiceApi', (): void => {
            expect(new SquareClient(accessToken).getInvoiceApi()).to.be.instanceOf(InvoicesApi);
        });
    });
});
