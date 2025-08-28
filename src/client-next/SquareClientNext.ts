import upperFirst from 'lodash.upperfirst';
import { SquareClient, SquareEnvironment } from 'square';
import type { Environment } from 'square-legacy/src/configuration';
import type { FunctionKeys } from 'utility-types';
import { v4 as uuidv4 } from 'uuid';
import { SquareApiException } from '../exception';
import type { ISquareClientConfig, ISquareClientDefaultConfig, ISquareClientMergedConfig } from '../interface';
import type { ILogger } from '../logger';
import { NullLogger } from '../logger';
import type {
    ApplePayClient,
    ApplePayMethod,
    CardsClient,
    CardsMethod,
    CatalogClient,
    CatalogMethod,
    CheckoutClient,
    CheckoutMethod,
    CustomersClient,
    CustomersMethod,
    EmployeesClient,
    EmployeesMethod,
    GiftCardsClient,
    GiftCardsMethod,
    InventoryClient,
    InventoryMethod,
    InvoicesClient,
    InvoicesMethod,
    LaborClient,
    LaborMethod,
    LocationsClient,
    LocationsMethod,
    LoyaltyClient,
    LoyaltyMethod,
    MerchantsClient,
    MerchantsMethod,
    MobileClient,
    MobileMethod,
    OAuthClient,
    OAuthMethod,
    OrdersClient,
    OrdersMethod,
    PaymentsClient,
    PaymentsMethod,
    RefundsClient,
    RefundsMethod,
    SquareClientResourceName,
    TeamClient,
    TeamMethod,
    V1TransactionsClient,
    V1TransactionsMethod,
} from '../type/SquareResourceTypes';
import { exponentialDelay, isRetryableSquareApiException, mergeDeepProps, sleep } from '../utils';

export class SquareClientNext {
    #client: SquareClient;
    readonly #mergedConfig: ISquareClientMergedConfig;
    readonly #defaultConfig: ISquareClientDefaultConfig = {
        retry: { maxRetries: 6, retryDelay: exponentialDelay },
        // ! configuration interface was changed
        configuration: {
            timeout: 60000,
            squareVersion: '2024-12-18',
            additionalHeaders: {},
            userAgentDetail: '',
            environment: SquareEnvironment.Production as Environment,
            customUrl: 'https://connect.squareup.com',
        },
        logContext: { merchantId: 'unknown' },
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

    getOriginClient(): SquareClient {
        return (this.#client ??= new SquareClient({ ...this.#mergedConfig.configuration, token: this.accessToken }));
    }

    getApplePayApi(retryableMethods: ApplePayMethod[] = []): ApplePayClient {
        return this.proxy('applePay', retryableMethods);
    }

    getCardsApi(retryableMethods: CardsMethod[] = ['get', 'list', 'disable']): CardsClient {
        return this.proxy('cards', retryableMethods);
    }

    getCatalogApi(retryableMethods: CatalogMethod[] = ['batchGet', 'info', 'list', 'search', 'searchItems']): CatalogClient {
        return this.proxy('catalog', retryableMethods);
    }

    getCheckoutApi(retryableMethods: CheckoutMethod[] = []): CheckoutClient {
        return this.proxy('checkout', retryableMethods);
    }

    getCustomersApi(retryableMethods: CustomersMethod[] = ['get', 'list', 'search', 'delete']): CustomersClient {
        return this.proxy('customers', retryableMethods);
    }

    getEmployeesApi(retryableMethods: EmployeesMethod[] = ['get', 'list']): EmployeesClient {
        return this.proxy('employees', retryableMethods);
    }

    getLoyaltyApi(retryableMethods: LoyaltyMethod[] = ['searchEvents']): LoyaltyClient {
        return this.proxy('loyalty', retryableMethods);
    }

    getInventoryApi(
        retryableMethods: InventoryMethod[] = ['getAdjustment', 'batchGetChanges', 'batchGetCounts', 'getPhysicalCount', 'getTransfer', 'get', 'changes'],
    ): InventoryClient {
        return this.proxy('inventory', retryableMethods);
    }

    getLaborApi(retryableMethods: LaborMethod[] = []): LaborClient {
        return this.proxy('labor', retryableMethods);
    }

    getLocationsApi(retryableMethods: LocationsMethod[] = ['list']): LocationsClient {
        return this.proxy('locations', retryableMethods);
    }

    getMerchantsApi(retryableMethods: MerchantsMethod[] = ['get', 'list']): MerchantsClient {
        return this.proxy('merchants', retryableMethods);
    }

    getMobileAuthorizationApi(retryableMethods: MobileMethod[] = []): MobileClient {
        return this.proxy('mobile', retryableMethods);
    }

    getOAuthApi(retryableMethods: OAuthMethod[] = ['obtainToken']): OAuthClient {
        return this.proxy('oAuth', retryableMethods);
    }

    getOrdersApi(retryableMethods: OrdersMethod[] = ['batchGet', 'calculate', 'search', 'create', 'pay']): OrdersClient {
        return this.proxy('orders', retryableMethods);
    }

    getPaymentsApi(retryableMethods: PaymentsMethod[] = ['list', 'create', 'get', 'cancel']): PaymentsClient {
        return this.proxy('payments', retryableMethods);
    }

    getGiftCardsApi(
        retryableMethods: GiftCardsMethod[] = ['list', 'create', 'getFromGan', 'getFromNonce', 'linkCustomer', 'unlinkCustomer', 'get'],
    ): GiftCardsClient {
        return this.proxy('giftCards', retryableMethods);
    }

    getRefundsApi(retryableMethods: RefundsMethod[] = ['list', 'refundPayment', 'get']): RefundsClient {
        return this.proxy('refunds', retryableMethods);
    }

    getTransactionsApi(retryableMethods: V1TransactionsMethod[] = ['v1ListOrders', 'v1RetrieveOrder']): V1TransactionsClient {
        return this.proxy('v1Transactions', retryableMethods);
    }

    getInvoiceApi(retryableMethods: InvoicesMethod[] = ['list', 'search', 'get']): InvoicesClient {
        return this.proxy('invoices', retryableMethods);
    }

    getTeamApi(retryableMethods: TeamMethod[] = ['listJobs', 'createJob', 'retrieveJob', 'updateJob']): TeamClient {
        return this.proxy('team', retryableMethods);
    }

    /**
     * @throws SquareApiException
     */
    protected proxy<T extends SquareClientResourceName>(apiName: T, retryableMethods: FunctionKeys<SquareClient[T]>[]): SquareClient[T] {
        const api = this.getOriginClient()[apiName];

        return this.proxyWithInstance(apiName, api, retryableMethods);
    }

    private getLogger(): ILogger {
        return this.#mergedConfig.logger ?? (this.#mergedConfig.logger = new NullLogger());
    }

    /**
     * @throws SquareApiException
     */
    private proxyWithInstance<T extends SquareClientResourceName, A extends SquareClient[T]>(apiName: T, api: A, retryableMethods: FunctionKeys<A>[]): A {
        const stackError: string = new Error().stack?.slice(6) || '';

        const handler: ProxyHandler<A> = {
            get: (target: A, apiMethodName: string): unknown => {
                return async (...args: unknown[]): Promise<any> => {
                    const requestFn: (...arg: unknown[]) => Promise<any> = target[apiMethodName].bind(target, ...args);

                    try {
                        return await this.makeRetryable<any>(apiName, requestFn, apiMethodName, retryableMethods);
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

    private async makeRetryable<T>(
        apiName: SquareClientResourceName,
        promiseFn: (...arg: unknown[]) => Promise<T>,
        apiMethodName: string,
        retryableMethods: (string | number | symbol)[],
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

                const logMeta = {
                    ...logContext,
                    apiName: upperFirst(apiName),
                    apiMethodName,
                    startedAt,
                    finishedAt,
                    execTime,
                    retries,
                    maxRetries,
                    exception: squareException.toObject(),
                };

                if ([429].includes(squareException.statusCode) || squareException.statusCode >= 500) {
                    logger.warn('Square api error', logMeta);
                }

                if (retryableMethods.includes(apiMethodName) && (await retryCondition(squareException, maxRetries, retries))) {
                    logger.info('Square api retry', logMeta);

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
                    apiName: upperFirst(apiName),
                    apiMethodName,
                    startedAt,
                    finishedAt,
                    execTime,
                });
            }
        }

        return retry();
    }

    private retryCondition: (error: SquareApiException, maxRetries: number, retries: number) => Promise<boolean> = async (
        error: SquareApiException,
        maxRetries: number,
        retries: number,
    ) => {
        if (isRetryableSquareApiException(error) && maxRetries > retries) {
            return true;
        }

        throw error;
    };
}
