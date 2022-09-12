import type { ApiResponse, Error as SquareError } from 'square';
import {
    ApplePayApi,
    CardsApi,
    CatalogApi,
    CheckoutApi,
    Client,
    DEFAULT_CONFIGURATION,
    EmployeesApi,
    GiftCardActivitiesApi,
    GiftCardsApi,
    InventoryApi,
    InvoicesApi,
    LaborApi,
    LocationsApi,
    LoyaltyApi,
    MerchantsApi,
    MobileAuthorizationApi,
    OAuthApi,
    OrdersApi,
    PaymentsApi,
    RefundsApi,
    TransactionsApi,
} from 'square';
import { v4 as uuidv4 } from 'uuid';
import { retryableErrorCodes } from '../constants';
import { SquareApiException } from '../exception';
import type { ISquareClientConfig, ISquareClientDefaultConfig, ISquareClientMergedConfig } from '../interface';
import type { ILogger } from '../logger';
import { NullLogger } from '../logger';
import { exponentialDelay, mergeDeepProps, sleep } from '../utils';
import { CustomerClientApi } from './CustomerClientApi';

export class SquareClient {
    #client: Client;
    readonly #mergedConfig: ISquareClientMergedConfig;
    readonly #defaultConfig: ISquareClientDefaultConfig = {
        retry: {
            maxRetries: 6,
            retryDelay: exponentialDelay,
        },
        configuration: DEFAULT_CONFIGURATION,
    };

    constructor(private readonly accessToken: string, config: ISquareClientConfig = {}) {
        const { logger, ...configWithoutLogger } = config;
        this.#mergedConfig = mergeDeepProps(this.#defaultConfig, configWithoutLogger);
        this.#mergedConfig.logger = config.logger;
    }

    /**
     * Generate unique idempotency key (format: first char reference-uuid)
     * @link https://developer.squareup.com/docs/working-with-apis/idempotency
     * Max length 45
     * @return uuidv4
     */
    static generateIdempotencyKey(): string {
        return uuidv4();
    }

    getConfig(): ISquareClientMergedConfig {
        return this.#mergedConfig;
    }

    getOriginClient(): Client {
        this.#client = this.#client ?? this.createOriginClient(this.accessToken, this.#mergedConfig);

        return this.#client;
    }

    getApplePayApi(retryableMethods: string[] = []): ApplePayApi {
        return this.proxy(new ApplePayApi(this.getOriginClient()), retryableMethods);
    }

    getCatalogApi(
        retryableMethods: string[] = ['batchRetrieveCatalogObjects', 'catalogInfo', 'listCatalog', 'retrieveCatalogObject', 'searchCatalogObjects'],
    ): CatalogApi {
        return this.proxy(new CatalogApi(this.getOriginClient()), retryableMethods);
    }

    getCheckoutApi(retryableMethods: string[] = []): CheckoutApi {
        return this.proxy(new CheckoutApi(this.getOriginClient()), retryableMethods);
    }

    getCustomersApi(retryableMethods: string[] = ['listCustomers', 'retrieveCustomer', 'searchCustomers', 'deleteCustomerCard']): CustomerClientApi {
        return this.proxy(new CustomerClientApi(this.getOriginClient()), retryableMethods);
    }

    getEmployeesApi(retryableMethods: string[] = ['listEmployees', 'retrieveEmployee']): EmployeesApi {
        return this.proxy(new EmployeesApi(this.getOriginClient()), retryableMethods);
    }

    getLoyaltyApi(
        retryableMethods: string[] = [
            'listLoyaltyPrograms',
            'searchLoyaltyEvents',
            'searchLoyaltyAccounts',
            'retrieveLoyaltyAccount',
            'retrieveLoyaltyProgram',
        ],
    ): LoyaltyApi {
        return this.proxy(new LoyaltyApi(this.getOriginClient()), retryableMethods);
    }

    getInventoryApi(
        retryableMethods: string[] = [
            'batchRetrieveInventoryChanges',
            'batchRetrieveInventoryCounts',
            'retrieveInventoryAdjustment',
            'retrieveInventoryChanges',
            'retrieveInventoryCount',
            'retrieveInventoryPhysicalCount',
        ],
    ): InventoryApi {
        return this.proxy(new InventoryApi(this.getOriginClient()), retryableMethods);
    }

    getLaborApi(
        retryableMethods: string[] = [
            'getBreakType',
            'getEmployeeWage',
            'getShift',
            'listBreakTypes',
            'listEmployeeWages',
            'listWorkweekConfigs',
            'searchShifts',
        ],
    ): LaborApi {
        return this.proxy(new LaborApi(this.getOriginClient()), retryableMethods);
    }

    getLocationsApi(retryableMethods: string[] = ['listLocations']): LocationsApi {
        return this.proxy(new LocationsApi(this.getOriginClient()), retryableMethods);
    }

    getMerchantsApi(retryableMethods: string[] = ['retrieveMerchant', 'listMerchants']): MerchantsApi {
        return this.proxy(new MerchantsApi(this.getOriginClient()), retryableMethods);
    }

    getMobileAuthorizationApi(retryableMethods: string[] = []): MobileAuthorizationApi {
        return this.proxy(new MobileAuthorizationApi(this.getOriginClient()), retryableMethods);
    }

    getOAuthApi(retryableMethods: string[] = []): OAuthApi {
        return this.proxy(new OAuthApi(this.getOriginClient()), retryableMethods);
    }

    getOrdersApi(retryableMethods: string[] = ['batchRetrieveOrders', 'searchOrders', 'createOrder', 'payOrder', 'calculateOrder']): OrdersApi {
        return this.proxy(new OrdersApi(this.getOriginClient()), retryableMethods);
    }

    getPaymentsApi(retryableMethods: string[] = ['getPayment', 'listPayments', 'createPayment', 'cancelPayment']): PaymentsApi {
        return this.proxy(new PaymentsApi(this.getOriginClient()), retryableMethods);
    }

    getGiftCardsApi(
        retryableMethods: string[] = [
            'listGiftCards',
            'createGiftCard',
            'retrieveGiftCardFromGAN',
            'retrieveGiftCardFromNonce',
            'linkCustomerToGiftCard',
            'unlinkCustomerFromGiftCard',
            'retrieveGiftCard',
        ],
    ): GiftCardsApi {
        return this.proxy(new GiftCardsApi(this.getOriginClient()), retryableMethods);
    }

    getGiftCardActivitiesApi(retryableMethods: string[] = ['listGiftCardActivities', 'createGiftCardActivity']): GiftCardActivitiesApi {
        return this.proxy(new GiftCardActivitiesApi(this.getOriginClient()), retryableMethods);
    }

    getRefundsApi(retryableMethods: string[] = ['getPaymentRefund', 'listPaymentRefunds', 'refundPayment']): RefundsApi {
        return this.proxy(new RefundsApi(this.getOriginClient()), retryableMethods);
    }

    getTransactionsApi(retryableMethods: string[] = ['listRefunds', 'listTransactions', 'retrieveTransaction']): TransactionsApi {
        return this.proxy(new TransactionsApi(this.getOriginClient()), retryableMethods);
    }

    getCardsApi(retryableMethods: string[] = ['listCards', 'retrieveCard', 'disableCard']): CardsApi {
        return this.proxy(new CardsApi(this.getOriginClient()), retryableMethods);
    }

    getInvoiceApi(retryableMethods: string[] = ['listInvoices', 'searchInvoices', 'getInvoice']): InvoicesApi {
        return this.proxy(new InvoicesApi(this.getOriginClient()), retryableMethods);
    }

    private createOriginClient(accessToken: string, { configuration }: Partial<ISquareClientConfig>): Client {
        return new Client({ ...configuration, accessToken });
    }

    private getLogger(): ILogger {
        return this.#mergedConfig.logger ?? (this.#mergedConfig.logger = new NullLogger());
    }

    /**
     * @throws SquareApiException
     */
    private proxy<T extends object>(api: T, retryableMethods: string[]): T {
        const stackError: string = new Error().stack?.slice(6) || '';

        const handler: ProxyHandler<T> = {
            get: (target: T, apiMethodName: string): unknown => {
                return async (...args: unknown[]): Promise<ApiResponse<T>> => {
                    const requestFn: (...arg: unknown[]) => Promise<ApiResponse<T>> = target[apiMethodName].bind(target, ...args);

                    try {
                        return await this.makeRetryable<ApiResponse<T>>(api, requestFn, apiMethodName, retryableMethods);
                    } catch (err) {
                        if (err instanceof Error) {
                            err.stack += stackError;
                        }

                        throw err;
                    }
                };
            },
        };

        return new Proxy<T>(api, handler);
    }

    private async makeRetryable<T>(api, promiseFn: (...arg: unknown[]) => Promise<T>, apiMethodName: string, retryableMethods: string[]): Promise<T> {
        let retries: number = 0;
        const { maxRetries, retryCondition = this.retryCondition } = this.#mergedConfig.retry;
        const logger = this.getLogger();

        async function retry(): Promise<T> {
            const startedAt = Date.now();
            try {
                return await promiseFn();
            } catch (error) {
                const finishedAt = Date.now();
                const execTime = finishedAt - startedAt;
                const squareException: SquareApiException = new SquareApiException(error, retries, execTime);

                if (retryableMethods.includes(apiMethodName) && (await retryCondition(squareException, maxRetries, retries))) {
                    logger.info('Square api retry', {
                        retries,
                        maxRetries,
                        apiName: api.constructor.name,
                        apiMethodName,
                        startedAt,
                        finishedAt,
                        execTime,
                        exception: squareException.toObject(),
                    });

                    retries++;
                    const delay: number = exponentialDelay(retries);
                    await sleep(delay);

                    return retry();
                }

                throw squareException;
            } finally {
                const finishedAt = Date.now();
                const execTime = finishedAt - startedAt;
                logger.info(`Square api request: ${apiMethodName} executed in ${execTime}ms`, {
                    apiName: api.constructor.name,
                    apiMethodName,
                    startedAt,
                    finishedAt,
                    execTime,
                });
            }
        }

        return retry();
    }

    private isRetryableException(error: SquareApiException): boolean {
        const squareError: SquareError | undefined = error.errors?.[0];
        const isRetryableResponseStatusCode =
            [408, 429].includes(error.statusCode) || (error.statusCode >= 500 && error.statusCode <= 599 && error.statusCode !== 501);
        if (squareError) {
            return retryableErrorCodes.includes(squareError.code);
        }

        return isRetryableResponseStatusCode;
    }

    private retryCondition: (error: SquareApiException, maxRetries: number, retries: number) => Promise<boolean> = async (
        error: SquareApiException,
        maxRetries: number,
        retries: number,
    ) => {
        if (this.isRetryableException(error) && maxRetries > retries) {
            return true;
        }

        throw error;
    };
}
