import type { CalculateOrderResponse, Order, SearchCustomersRequest } from 'square';
import { Environment, DEFAULT_CONFIGURATION } from 'square';
import type { ISquareClientConfig } from '../../../src';
import { SquareClient, SquareApiException, recursiveBigIntToNumber, SquareDataMapper } from '../../../src';

describe('SquareClient (integration)', (): void => {
    const accessToken: string = `${process.env.SQUARE_ACCESS_TOKEN || ''}`;
    const customUrl: string = `${process.env.SQUARE_SANDBOX_BASE_URL || ''}`;

    const config: ISquareClientConfig = {
        retry: {
            maxRetries: 1,
        },
        configuration: {
            ...DEFAULT_CONFIGURATION,
            customUrl,
            environment: Environment.Sandbox,
        },
    };

    describe('#getLocationsApi', (): void => {
        it('should retry by timeout', async (): Promise<unknown> => {
            return new SquareClient(accessToken, {
                ...config,
                ...{
                    configuration: {
                        timeout: 1,
                    },
                },
            })
                .getLocationsApi()
                .listLocations()
                .should.eventually.be.rejectedWith(SquareApiException, 'timeout of 1ms exceeded');
        });

        it('should retrieve data', async (): Promise<unknown> => {
            return new SquareClient(accessToken, config)
                .getLocationsApi()
                .listLocations()
                .should.eventually.be.fulfilled.and.have.property('result')
                .and.have.property('locations');
        });
    });

    describe('#getCustomersApi', (): void => {
        it('should be rejected with ModelError', async (): Promise<unknown> => {
            const query: SearchCustomersRequest = SquareDataMapper.toNewFormat({
                limit: 1,
                query: {
                    sort: {
                        order: 'WRONG_VALUE',
                    },
                },
            });
            return new SquareClient(accessToken, config)
                .getCustomersApi()
                .searchCustomers(query)
                .should.eventually.be.rejectedWith(Error, /^`WRONG_VALUE` is not a valid enum value for.*/);
        });
    });

    describe('#getOrdersApi', (): void => {
        it('should calculate order total', async (): Promise<void> => {
            const apiClient: SquareClient = new SquareClient(accessToken, { configuration: { ...config.configuration, timeout: 60_000 } });
            const { locations } = (await apiClient.getLocationsApi().listLocations()).result;

            if (!locations?.length) {
                locations?.should.have.length(0);
                return;
            }

            const locationId: string = locations[0].id!;
            const orderPayload: Order = SquareDataMapper.toNewFormat(
                {
                    locationId: locationId,
                    lineItems: [
                        {
                            name: 'Coca-cola',
                            quantity: '1',
                            basePriceMoney: {
                                amount: 100,
                                currency: 'USD',
                            },
                        },
                    ],
                },
                false,
            );

            const { order }: CalculateOrderResponse = (await apiClient.getOrdersApi().calculateOrder({ order: orderPayload })).result;

            recursiveBigIntToNumber(order!).totalMoney?.amount?.should.eq(100);
        });
    });
});
