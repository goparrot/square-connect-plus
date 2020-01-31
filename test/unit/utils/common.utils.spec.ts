import { mergeDeepProps } from '../../../src/utils';

describe('common.utils (unit)', (): void => {
    describe('#mergeDeepProps', (): void => {
        it('should merge object props', async (): Promise<any> => {
            return mergeDeepProps({ a: { b: 1 }, c: 1, d: 1 }, { a: { b: 2 }, c: 2, e: 2 }).should.be.deep.eq({ a: { b: 2 }, c: 2, d: 1, e: 2 });
        });
    });
});
