import { exponentialDelay, makeRetryable } from '../../../src/utils';

describe('retry.utils (unit)', (): void => {
    describe('#exponentialDelay', (): void => {
        it('should return >= 200 and <= 250', async (): Promise<any> => {
            return exponentialDelay(1)
                .should.be.gte(200)
                .and.lte(240);
        });

        it('should return >= 400 and <= 500', async (): Promise<any> => {
            return exponentialDelay(2)
                .should.be.gte(400)
                .and.lte(480);
        });

        it('should return >= 800 and <= 1200', async (): Promise<any> => {
            return exponentialDelay(3)
                .should.be.gte(800)
                .and.lte(1000);
        });
    });

    describe('#makeRetryable', (): void => {
        it('should throw SquareException', async (): Promise<any> => {
            return makeRetryable(
                async (): Promise<any> => {
                    throw new Error('test error');
                },
                {
                    maxRetries: 1,
                    retryDelay: exponentialDelay,
                    retryCondition: async (_error: Error, maxRetries: number, retries: number): Promise<boolean> => maxRetries > retries,
                },
            ).should.be.rejectedWith(Error, 'Square API error');
        });
    });
});
