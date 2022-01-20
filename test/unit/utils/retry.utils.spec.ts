import { exponentialDelay } from '../../../src';

describe('retry.utils (unit)', () => {
    describe('#exponentialDelay', () => {
        it('should return >= 200 and <= 250', async (): Promise<void> => {
            exponentialDelay(1).should.be.gte(200).and.lte(240);
        });

        it('should return >= 400 and <= 500', async (): Promise<void> => {
            exponentialDelay(2).should.be.gte(400).and.lte(480);
        });

        it('should return >= 800 and <= 1200', async (): Promise<void> => {
            exponentialDelay(3).should.be.gte(800).and.lte(1000);
        });
    });
});
