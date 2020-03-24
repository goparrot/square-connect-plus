import { SearchCustomersRequest } from 'square-connect';
import { SquareClient } from '../../../src/client';
import { SquareException } from '../../../src/exception';
import { ISquareClientConfig } from '../../../src/interface';

describe('SquareClient (integration)', (): void => {
    const accessToken: string = `${process.env.SQUARE_ACCESS_TOKEN}`;
    const basePath: string = `${process.env.SQUARE_BASE_URL}`;

    const config: ISquareClientConfig = {
        retry: {
            maxRetries: 1,
        },
        originClient: {
            timeout: 10000,
            basePath,
        },
    };

    describe('#getLocationsApi', (): void => {
        it('should retry by timeout', async (): Promise<any> => {
            return new SquareClient(accessToken, {
                ...config,
                ...{
                    originClient: {
                        timeout: 1,
                    },
                },
            })
                .getLocationsApi()
                .listLocations()
                .should.eventually.be.rejectedWith(SquareException, 'Square API timeout');
        });

        it('should retrieve data', async (): Promise<any> => {
            return new SquareClient(accessToken, config).getLocationsApi().listLocations().should.eventually.be.fulfilled.and.have.property('locations');
        });
    });

    describe('#getCustomersApi', (): void => {
        it('should be rejected with ModelError', async (): Promise<any> => {
            const query: SearchCustomersRequest = {
                limit: 1,
                query: {
                    sort: {
                        order: 'WRONG_VALUE' as any,
                    },
                },
            };

            return new SquareClient(accessToken, config)
                .getCustomersApi()
                .searchCustomers(query)
                .should.eventually.be.rejectedWith(Error, '`WRONG_VALUE` is not a valid enum value for `query.sort.order`.');
        });
    });
});
