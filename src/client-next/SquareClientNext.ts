import upperFirst from 'lodash.upperfirst';
import { SquareClient } from 'square';
import type { ApplePay } from 'square/api/resources/applePay/client/Client';
import type { Cards } from 'square/api/resources/cards/client/Client';
import type { Catalog } from 'square/api/resources/catalog/client/Client';
import type { Checkout } from 'square/api/resources/checkout/client/Client';
import type { Customers } from 'square/api/resources/customers/client/Client';
import type { Employees } from 'square/api/resources/employees/client/Client';
import type { GiftCards } from 'square/api/resources/giftCards/client/Client';
import type { Inventory } from 'square/api/resources/inventory/client/Client';
import type { Invoices } from 'square/api/resources/invoices/client/Client';
import type { Labor } from 'square/api/resources/labor/client/Client';
import type { Locations } from 'square/api/resources/locations/client/Client';
import type { Loyalty } from 'square/api/resources/loyalty/client/Client';
import type { Merchants } from 'square/api/resources/merchants/client/Client';
import type { Mobile } from 'square/api/resources/mobile/client/Client';
import type { OAuth } from 'square/api/resources/oAuth/client/Client';
import type { Orders } from 'square/api/resources/orders/client/Client';
import type { Payments } from 'square/api/resources/payments/client/Client';
import type { Refunds } from 'square/api/resources/refunds/client/Client';
import type { Team } from 'square/api/resources/team/client/Client';
import type { V1Transactions } from 'square/api/resources/v1Transactions/client/Client';
import { type ApiResponse, DEFAULT_CONFIGURATION } from 'square/legacy';
import type { FunctionKeys, NonFunctionKeys, ReadonlyKeys } from 'utility-types';
import { v4 as uuidv4 } from 'uuid';
import { SquareApiException } from '../exception';
import type { ISquareClientConfig, ISquareClientDefaultConfig, ISquareClientMergedConfig } from '../interface';
import type { ILogger } from '../logger';
import { NullLogger } from '../logger';
import { exponentialDelay, isRetryableSquareApiException, mergeDeepProps, sleep } from '../utils';

type ApiName = Extract<ReadonlyKeys<SquareClient>, NonFunctionKeys<SquareClient>>;

export class SquareClientNext {
    #client: SquareClient;
    readonly #mergedConfig: ISquareClientMergedConfig;
    readonly #defaultConfig: ISquareClientDefaultConfig = {
        retry: {
            maxRetries: 6,
            retryDelay: exponentialDelay,
        },
        // ! configuration interface was changed
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

    getOriginClient(): SquareClient {
        this.#client = this.#client ?? this.createOriginClient(this.accessToken, this.#mergedConfig);

        return this.#client;
    }

    getApplePayApi(retryableMethods: FunctionKeys<ApplePay>[] = []): ApplePay {
        return this.proxy('applePay', retryableMethods);
    }

    getCatalogApi(
        retryableMethods: FunctionKeys<Catalog>[] = [
            'batchRetrieveCatalogObjects',
            'catalogInfo',
            'listCatalog',
            'retrieveCatalogObject',
            'searchCatalogObjects',
        ],
    ): Catalog {
        return this.proxy('catalog', retryableMethods);
    }

    getCheckoutApi(retryableMethods: FunctionKeys<Checkout>[] = []): Checkout {
        return this.proxy('checkout', retryableMethods);
    }

    getCustomersApi(retryableMethods: FunctionKeys<Customers>[] = ['listCustomers', 'retrieveCustomer', 'searchCustomers', 'deleteCustomerCard']): Customers {
        return this.proxy('customers', retryableMethods);
    }

    getEmployeesApi(retryableMethods: FunctionKeys<Employees>[] = ['listEmployees', 'retrieveEmployee']): Employees {
        return this.proxy('employees', retryableMethods);
    }

    getLoyaltyApi(
        retryableMethods: FunctionKeys<Loyalty>[] = [
            'listLoyaltyPrograms',
            'searchLoyaltyEvents',
            'searchLoyaltyAccounts',
            'retrieveLoyaltyAccount',
            'retrieveLoyaltyProgram',
        ],
    ): Loyalty {
        return this.proxy('loyalty', retryableMethods);
    }

    getInventoryApi(
        retryableMethods: FunctionKeys<Inventory>[] = [
            'batchRetrieveInventoryChanges',
            'batchRetrieveInventoryCounts',
            'retrieveInventoryAdjustment',
            'retrieveInventoryChanges',
            'retrieveInventoryCount',
            'retrieveInventoryPhysicalCount',
        ],
    ): Inventory {
        return this.proxy('inventory', retryableMethods);
    }

    getLaborApi(
        retryableMethods: FunctionKeys<Labor>[] = [
            'getBreakType',
            'getEmployeeWage',
            'getShift',
            'listBreakTypes',
            'listEmployeeWages',
            'listWorkweekConfigs',
            'searchShifts',
        ],
    ): Labor {
        return this.proxy('labor', retryableMethods);
    }

    getLocationsApi(retryableMethods: FunctionKeys<Locations>[] = ['listLocations']): Locations {
        return this.proxy('locations', retryableMethods);
    }

    getMerchantsApi(retryableMethods: FunctionKeys<Merchants>[] = ['retrieveMerchant', 'listMerchants']): Merchants {
        return this.proxy('merchants', retryableMethods);
    }

    getMobileAuthorizationApi(retryableMethods: FunctionKeys<Mobile>[] = []): Mobile {
        return this.proxy('mobile', retryableMethods);
    }

    getOAuthApi(retryableMethods: FunctionKeys<OAuth>[] = ['obtainToken']): OAuth {
        return this.proxy('oAuth', retryableMethods);
    }

    getOrdersApi(retryableMethods: FunctionKeys<Orders>[] = ['batchRetrieveOrders', 'searchOrders', 'createOrder', 'payOrder', 'calculateOrder']): Orders {
        return this.proxy('orders', retryableMethods);
    }

    getPaymentsApi(retryableMethods: FunctionKeys<Payments>[] = ['getPayment', 'listPayments', 'createPayment', 'cancelPayment']): Payments {
        return this.proxy('payments', retryableMethods);
    }

    getGiftCardsApi(
        retryableMethods: FunctionKeys<GiftCards>[] = [
            'listGiftCards',
            'createGiftCard',
            'retrieveGiftCardFromGAN',
            'retrieveGiftCardFromNonce',
            'linkCustomerToGiftCard',
            'unlinkCustomerFromGiftCard',
            'retrieveGiftCard',
        ],
    ): GiftCards {
        return this.proxy('giftCards', retryableMethods);
    }

    getRefundsApi(retryableMethods: FunctionKeys<Refunds>[] = ['getPaymentRefund', 'listPaymentRefunds', 'refundPayment']): Refunds {
        return this.proxy('refunds', retryableMethods);
    }

    getTransactionsApi(retryableMethods: FunctionKeys<V1Transactions>[] = ['listTransactions', 'retrieveTransaction']): V1Transactions {
        return this.proxy('v1Transactions', retryableMethods);
    }

    getCardsApi(retryableMethods: FunctionKeys<Cards>[] = ['listCards', 'retrieveCard', 'disableCard']): Cards {
        return this.proxy('cards', retryableMethods);
    }

    getInvoiceApi(retryableMethods: FunctionKeys<Invoices>[] = ['listInvoices', 'searchInvoices', 'getInvoice']): Invoices {
        return this.proxy('invoices', retryableMethods);
    }

    getTeamApi(
        retryableMethods: FunctionKeys<Team>[] = [
            'createTeamMember',
            'bulkCreateTeamMembers',
            'bulkUpdateTeamMembers',
            'searchTeamMembers',
            'retrieveTeamMember',
            'updateTeamMember',
            'retrieveWageSetting',
            'updateWageSetting',
        ],
    ): Team {
        return this.proxy('team', retryableMethods);
    }

    /**
     * @throws SquareApiException
     */
    protected proxy<T extends ApiName>(apiName: T, retryableMethods: FunctionKeys<SquareClient[T]>[]): SquareClient[T] {
        const api = this.getOriginClient()[apiName];

        return this.proxyWithInstance(apiName, api, retryableMethods);
    }

    private createOriginClient(token: string, { configuration }: Partial<ISquareClientConfig>): SquareClient {
        return new SquareClient({ ...configuration, token });
    }

    private getLogger(): ILogger {
        return this.#mergedConfig.logger ?? (this.#mergedConfig.logger = new NullLogger());
    }

    /**
     * @throws SquareApiException
     */
    private proxyWithInstance<T extends ApiName, A extends SquareClient[T]>(apiName: T, api: A, retryableMethods: FunctionKeys<A>[]): A {
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

    private async makeRetryable<T>(
        apiName: ApiName,
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
