import capitalize from 'lodash.capitalize';
import type {
    ApiResponse,
    Error as SquareError,
    ApplePayApi,
    CardsApi,
    CatalogApi,
    CheckoutApi,
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
import { Client, DEFAULT_CONFIGURATION } from 'square';
import { v4 as uuidv4 } from 'uuid';
import type { BaseApi } from 'square/dist/api/baseApi';
import { retryableErrorCodes } from '../constants';
import { SquareApiException } from '../exception';
import type { ISquareClientConfig, ISquareClientDefaultConfig, ISquareClientMergedConfig } from '../interface';
import type { ILogger } from '../logger';
import { NullLogger } from '../logger';
import { exponentialDelay, mergeDeepProps, sleep } from '../utils';
import { CustomerClientApi } from './CustomerClientApi';

type ApiName = {
    [key in keyof Client]: Client[key] extends BaseApi ? key : never;
}[keyof Client];

export class SquareClient {
    #client: Client;
    readonly #mergedConfig: ISquareClientMergedConfig;
    readonly #defaultConfig: ISquareClientDefaultConfig = {
        retry: {
            maxRetries: 6,
            retryDelay: exponentialDelay,
        },
        configuration: DEFAULT_CONFIGURATION,
        logContext: {
            merchantId: 'unknown',
        },
    };

    constructor(private readonly accessToken: string, config: ISquareClientConfig = {}) {
        const { logger, ...configWithoutLogger } = config;
        this.#mergedConfig = mergeDeepProps(this.#defaultConfig, configWithoutLogger);
        this.#mergedConfig.logger = logger;
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
        return this.proxy('applePayApi', retryableMethods);
    }

    getCatalogApi(
        retryableMethods: string[] = ['batchRetrieveCatalogObjects', 'catalogInfo', 'listCatalog', 'retrieveCatalogObject', 'searchCatalogObjects'],
    ): CatalogApi {
        return this.proxy('catalogApi', retryableMethods);
    }

    getCheckoutApi(retryableMethods: string[] = []): CheckoutApi {
        return this.proxy('checkoutApi', retryableMethods);
    }

    getCustomersApi(retryableMethods: string[] = ['listCustomers', 'retrieveCustomer', 'searchCustomers', 'deleteCustomerCard']): CustomerClientApi {
        return this.proxyWithInstance('customersApi', new CustomerClientApi(this.getOriginClient()), retryableMethods);
    }

    getEmployeesApi(retryableMethods: string[] = ['listEmployees', 'retrieveEmployee']): EmployeesApi {
        return this.proxy('employeesApi', retryableMethods);
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
        return this.proxy('loyaltyApi', retryableMethods);
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
        return this.proxy('inventoryApi', retryableMethods);
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
        return this.proxy('laborApi', retryableMethods);
    }

    getLocationsApi(retryableMethods: string[] = ['listLocations']): LocationsApi {
        return this.proxy('locationsApi', retryableMethods);
    }

    getMerchantsApi(retryableMethods: string[] = ['retrieveMerchant', 'listMerchants']): MerchantsApi {
        return this.proxy('merchantsApi', retryableMethods);
    }

    getMobileAuthorizationApi(retryableMethods: string[] = []): MobileAuthorizationApi {
        return this.proxy('mobileAuthorizationApi', retryableMethods);
    }

    getOAuthApi(retryableMethods: string[] = []): OAuthApi {
        return this.proxy('oAuthApi', retryableMethods);
    }

    getOrdersApi(retryableMethods: string[] = ['batchRetrieveOrders', 'searchOrders', 'createOrder', 'payOrder', 'calculateOrder']): OrdersApi {
        return this.proxy('ordersApi', retryableMethods);
    }

    getPaymentsApi(retryableMethods: string[] = ['getPayment', 'listPayments', 'createPayment', 'cancelPayment']): PaymentsApi {
        return this.proxy('paymentsApi', retryableMethods);
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
        return this.proxy('giftCardsApi', retryableMethods);
    }

    getGiftCardActivitiesApi(retryableMethods: string[] = ['listGiftCardActivities', 'createGiftCardActivity']): GiftCardActivitiesApi {
        return this.proxy('giftCardActivitiesApi', retryableMethods);
    }

    getRefundsApi(retryableMethods: string[] = ['getPaymentRefund', 'listPaymentRefunds', 'refundPayment']): RefundsApi {
        return this.proxy('refundsApi', retryableMethods);
    }

    getTransactionsApi(retryableMethods: string[] = ['listRefunds', 'listTransactions', 'retrieveTransaction']): TransactionsApi {
        return this.proxy('transactionsApi', retryableMethods);
    }

    getCardsApi(retryableMethods: string[] = ['listCards', 'retrieveCard', 'disableCard']): CardsApi {
        return this.proxy('cardsApi', retryableMethods);
    }

    getInvoiceApi(retryableMethods: string[] = ['listInvoices', 'searchInvoices', 'getInvoice']): InvoicesApi {
        return this.proxy('invoicesApi', retryableMethods);
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
    private proxyWithInstance<T extends ApiName, A extends Client[T]>(apiName: T, api: A, retryableMethods: string[]): A {
        const stackError: string = new Error().stack?.slice(6) || '';

        const handler: ProxyHandler<A> = {
            get: (target: A, apiMethodName: string): unknown => {
                return async (...args: unknown[]): Promise<ApiResponse<T>> => {
                    const requestFn: (...arg: unknown[]) => Promise<ApiResponse<T>> = target[apiMethodName].bind(target, ...args);

                    try {
                        return await this.makeRetryable<ApiResponse<T>>(apiName, requestFn, apiMethodName, retryableMethods);
                    } catch (err) {
                        if (err instanceof Error) {
                            err.stack += stackError;
                        }

                        throw err;
                    }
                };
            },
        };

        return new Proxy<A>(api, handler);
    }

    /**
     * @throws SquareApiException
     */
    private proxy<T extends ApiName>(apiName: T, retryableMethods: string[]): Client[T] {
        const api = this.getOriginClient()[apiName];

        return this.proxyWithInstance(apiName, api, retryableMethods);
    }

    private async makeRetryable<T>(
        apiName: ApiName,
        promiseFn: (...arg: unknown[]) => Promise<T>,
        apiMethodName: string,
        retryableMethods: string[],
    ): Promise<T> {
        let retries: number = 0;
        const { maxRetries, retryCondition = this.retryCondition } = this.#mergedConfig.retry;
        const { logContext } = this.#mergedConfig;
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
                        ...logContext,
                        retries,
                        maxRetries,
                        apiName: capitalize(apiName),
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
                    ...logContext,
                    apiName: capitalize(apiName),
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
