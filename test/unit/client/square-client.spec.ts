import { expect } from 'chai';
import {
    ApiClient,
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
} from 'square-connect';
import { SquareClient } from '../../../src/client';
import { ISquareClientConfig } from '../../../src/interface';
import { exponentialDelay } from '../../../src/utils';

describe('SquareClient (unit)', (): void => {
    const accessToken: string = 'test';
    const basePath: string = `${process.env.SQUARE_SANDBOX_BASE_URL}`;

    const config: ISquareClientConfig = {
        retry: {
            maxRetries: 1,
            retryDelay: exponentialDelay,
        },
        originClient: {
            timeout: 1000,
            cache: false,
            enableCookies: false,
            basePath,
        },
        logger: console,
    };

    describe('#constructor', (): void => {
        it('should be init with accessToken only (default config)', async (): Promise<any> => {
            return new SquareClient(accessToken).should.be.instanceOf(SquareClient);
        });

        it('should be init with accessToken and config', async (): Promise<any> => {
            return new SquareClient(accessToken, config).should.be.instanceOf(SquareClient);
        });
    });

    describe('#generateIdempotencyKey', (): void => {
        it('should return string', async (): Promise<any> => {
            const reference: string = 'test';
            return SquareClient.generateIdempotencyKey(reference)
                .should.be.match(new RegExp(`^${reference.charAt(0)}-.*`))
                .and.lengthOf(38);
        });
    });

    describe('#getConfig', (): void => {
        it('should return default configuration', async (): Promise<any> => {
            return new SquareClient(accessToken).getConfig().should.be.deep.eq({
                retry: {
                    maxRetries: 6,
                    retryDelay: exponentialDelay,
                },
                originClient: {
                    timeout: 15000,
                },
                logger: undefined,
            });
        });

        it('should return custom configuration', async (): Promise<any> => {
            return new SquareClient(accessToken, config).getConfig().should.be.deep.eq(config);
        });
    });

    describe('#getOriginApiClient', (): void => {
        it('should return ApiClient with default configuration', async (): Promise<any> => {
            const apiClient: ApiClient = new SquareClient(accessToken).getOriginApiClient();

            apiClient.should.be.instanceOf(ApiClient);
            apiClient.should.have.property('timeout', 15000);
            apiClient.should.have.property('cache', true);
            apiClient.should.have.property('enableCookies', false);
            apiClient.should.have.property('defaultHeaders').and.should.be.a('object');
            return apiClient.should.and.have.property('basePath', 'https://connect.squareup.com');
        });

        it('should return ApiClient with custom configuration', async (): Promise<any> => {
            const apiClient: ApiClient = new SquareClient(accessToken, config).getOriginApiClient();

            apiClient.should.be.instanceOf(ApiClient);
            apiClient.should.have.property('timeout', config.originClient?.timeout);
            apiClient.should.have.property('cache', config.originClient?.cache);
            apiClient.should.have.property('enableCookies', config.originClient?.enableCookies);
            apiClient.should.have.property('defaultHeaders').and.should.be.a('object');
            return apiClient.should.and.have.property('basePath', config.originClient?.basePath);
        });

        it('should return the same object on second call', async (): Promise<any> => {
            const squareClient: SquareClient = new SquareClient(accessToken);
            return squareClient.getOriginApiClient().should.be.deep.eq(squareClient.getOriginApiClient());
        });
    });

    describe('#getApplePayApi', (): void => {
        it('should return ApplePayApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getApplePayApi()).to.be.instanceOf(ApplePayApi);
        });
    });

    describe('#getCatalogApi', (): void => {
        it('should return CatalogApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getCatalogApi()).to.be.instanceOf(CatalogApi);
        });
    });

    describe('#getCheckoutApi', (): void => {
        it('should return CheckoutApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getCheckoutApi()).to.be.instanceOf(CheckoutApi);
        });
    });

    describe('#getCustomersApi', (): void => {
        it('should return CustomersApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getCustomersApi()).to.be.instanceOf(CustomersApi);
        });
    });

    describe('#getEmployeesApi', (): void => {
        it('should return EmployeesApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getEmployeesApi()).to.be.instanceOf(EmployeesApi);
        });
    });

    describe('#getInventoryApi', (): void => {
        it('should return InventoryApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getInventoryApi()).to.be.instanceOf(InventoryApi);
        });
    });

    describe('#getLaborApi', (): void => {
        it('should return LaborApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getLaborApi()).to.be.instanceOf(LaborApi);
        });
    });

    describe('#getLocationsApi', (): void => {
        it('should return LocationsApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getLocationsApi()).to.be.instanceOf(LocationsApi);
        });
    });

    describe('#getMobileAuthorizationApi', (): void => {
        it('should return MobileAuthorizationApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getMobileAuthorizationApi()).to.be.instanceOf(MobileAuthorizationApi);
        });
    });

    describe('#getOAuthApi', (): void => {
        it('should return OAuthApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getOAuthApi()).to.be.instanceOf(OAuthApi);
        });
    });

    describe('#getOrdersApi', (): void => {
        it('should return OrdersApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getOrdersApi()).to.be.instanceOf(OrdersApi);
        });
    });

    describe('#getPaymentsApi', (): void => {
        it('should return PaymentsApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getPaymentsApi()).to.be.instanceOf(PaymentsApi);
        });
    });

    describe('#getRefundsApi', (): void => {
        it('should return RefundsApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getRefundsApi()).to.be.instanceOf(RefundsApi);
        });
    });

    describe('#getTransactionsApi', (): void => {
        it('should return TransactionsApi', async (): Promise<any> => {
            expect(new SquareClient(accessToken).getTransactionsApi()).to.be.instanceOf(TransactionsApi);
        });
    });
});
