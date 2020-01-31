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
import { ISquareClientConfig, ISquareClientDefaultConfig, ISquareClientMergedConfig } from '../interface';
import { ILogger, NullLogger } from '../logger';
import { exponentialDelay, makeRetryable, mergeDeepProps, retryCondition } from '../utils';

export class SquareClient {
    private originApiClient: ApiClient;
    private readonly config: ISquareClientMergedConfig;
    private readonly defaultConfig: ISquareClientDefaultConfig = {
        retry: {
            maxRetries: 6,
            retryDelay: exponentialDelay,
        },
        originClient: {
            timeout: 15000,
        },
    };

    constructor(private readonly accessToken: string, config: ISquareClientConfig = {}) {
        this.config = mergeDeepProps(this.defaultConfig, config);
        this.config.logger = config.logger;
    }

    /**
     * Generate unique idempotency key (format: reference-timestampWithMilliseconds)
     */
    static generateIdempotencyKey(reference: string): string {
        return [reference, Date.now().toString()].join('-');
    }

    getConfig(): ISquareClientMergedConfig {
        return this.config;
    }

    getOriginApiClient(): ApiClient {
        return this.originApiClient ?? (this.originApiClient = this.createOriginApiClient(this.accessToken, this.config));
    }

    getApplePayApi(): ApplePayApi {
        const retryableMethods: string[] = [];

        return this.proxify(new ApplePayApi(this.getOriginApiClient()), retryableMethods);
    }

    getCatalogApi(): CatalogApi {
        const retryableMethods: string[] = ['batchRetrieveCatalogObjects', 'catalogInfo', 'listCatalog', 'retrieveCatalogObject', 'searchCatalogObjects'];

        return this.proxify(new CatalogApi(this.getOriginApiClient()), retryableMethods);
    }

    getCheckoutApi(): CheckoutApi {
        const retryableMethods: string[] = [];

        return this.proxify(new CheckoutApi(this.getOriginApiClient()), retryableMethods);
    }

    getCustomersApi(): CustomersApi {
        // createCustomerCard should not be retryable (#GP-2400)
        const retryableMethods: string[] = ['listCustomers', 'retrieveCustomer', 'searchCustomers', 'deleteCustomerCard'];

        return this.proxify(new CustomersApi(this.getOriginApiClient()), retryableMethods);
    }

    getEmployeesApi(): EmployeesApi {
        const retryableMethods: string[] = ['listEmployees', 'retrieveEmployee'];

        return this.proxify(new EmployeesApi(this.getOriginApiClient()), retryableMethods);
    }

    getInventoryApi(): InventoryApi {
        const retryableMethods: string[] = [
            'batchRetrieveInventoryChanges',
            'batchRetrieveInventoryCounts',
            'retrieveInventoryAdjustment',
            'retrieveInventoryChanges',
            'retrieveInventoryCount',
            'retrieveInventoryPhysicalCount',
        ];

        return this.proxify(new InventoryApi(this.getOriginApiClient()), retryableMethods);
    }

    getLaborApi(): LaborApi {
        const retryableMethods: string[] = [
            'getBreakType',
            'getEmployeeWage',
            'getShift',
            'listBreakTypes',
            'listEmployeeWages',
            'listWorkweekConfigs',
            'searchShifts',
        ];

        return this.proxify(new LaborApi(this.getOriginApiClient()), retryableMethods);
    }

    getLocationsApi(): LocationsApi {
        const retryableMethods: string[] = ['listLocations'];

        return this.proxify(new LocationsApi(this.getOriginApiClient()), retryableMethods);
    }

    getMobileAuthorizationApi(): MobileAuthorizationApi {
        const retryableMethods: string[] = [];

        return this.proxify(new MobileAuthorizationApi(this.getOriginApiClient()), retryableMethods);
    }

    getOAuthApi(): OAuthApi {
        const retryableMethods: string[] = [];

        return this.proxify(new OAuthApi(this.getOriginApiClient()), retryableMethods);
    }

    getOrdersApi(): OrdersApi {
        const retryableMethods: string[] = ['batchRetrieveOrders', 'searchOrders', 'createOrder', 'payOrder'];

        return this.proxify(new OrdersApi(this.getOriginApiClient()), retryableMethods);
    }

    getPaymentsApi(): PaymentsApi {
        const retryableMethods: string[] = ['getPayment', 'listPayments', 'createPayment', 'cancelPayment'];

        return this.proxify(new PaymentsApi(this.getOriginApiClient()), retryableMethods);
    }

    getRefundsApi(): RefundsApi {
        const retryableMethods: string[] = ['getPaymentRefund', 'listPaymentRefunds', 'refundPayment'];

        return this.proxify(new RefundsApi(this.getOriginApiClient()), retryableMethods);
    }

    getTransactionsApi(): TransactionsApi {
        const retryableMethods: string[] = ['listRefunds', 'listTransactions', 'retrieveTransaction'];

        return this.proxify(new TransactionsApi(this.getOriginApiClient()), retryableMethods);
    }

    private createOriginApiClient(accessToken: string, config: ISquareClientConfig): ApiClient {
        const apiClient: ApiClient = new ApiClient();
        apiClient.authentications.oauth2.accessToken = accessToken;

        return mergeDeepProps(apiClient, config.originClient);
    }

    private getLogger(): ILogger {
        return this.config.logger ?? (this.config.logger = new NullLogger());
    }

    private proxify<T extends object>(api: T, retryableMethods: string[]): T {
        let globalStack: string = '';
        try {
            throw new Error();
        } catch (err) {
            globalStack += err.stack.slice(6); // remove "Error:"
        }

        const handler: ProxyHandler<T> = {
            get: (target: T, apiMethodName: string): any => {
                if (!retryableMethods.includes(apiMethodName)) {
                    return target[apiMethodName];
                }

                return async (...args: any[]): Promise<any> => {
                    const requestFn: () => any = target[apiMethodName].bind(target, ...args);

                    this.getLogger().debug(`Square api request: ${JSON.stringify({ apiMethodName, args })}`);

                    try {
                        return await makeRetryable(requestFn, {
                            maxRetries: this.config.retry.maxRetries,
                            retryDelay: this.config.retry.retryDelay,
                            retryCondition: this.config.retry.retryCondition ?? retryCondition,
                        });
                    } catch (err) {
                        err.stack += globalStack;
                        throw err;
                    }
                };
            },
        };

        return new Proxy<T>(api, handler);
    }
}
