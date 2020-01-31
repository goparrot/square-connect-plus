import { mergeDeepProps } from '../../../src/utils';

describe('common.utils (unit)', (): void => {
    describe('#mergeDeepProps', (): void => {
        it('should correctly merge simple object with undefined', async (): Promise<any> => {
            return mergeDeepProps({ a: 1 }, undefined as any).should.be.deep.eq({ a: 1 });
        });

        it('should correctly merge class props with undefined', async (): Promise<any> => {
            const error: Error = new Error();
            return mergeDeepProps(error, undefined as any)
                .should.be.instanceOf(Error)
                .and.deep.eq(error)
                .and.have.property('name', 'Error');
        });

        it('should correctly merge 2 empty objects', async (): Promise<any> => {
            return mergeDeepProps({}, {}).should.be.deep.eq({});
        });

        it('should correctly merge 2 simple object props', async (): Promise<any> => {
            return mergeDeepProps({ a: 1, b: 1, c: 1 }, { b: 2, c: 2, e: 2 }).should.be.deep.eq({ a: 1, b: 2, c: 2, e: 2 });
        });

        it('should correctly merge 3 simple objects props', async (): Promise<any> => {
            return mergeDeepProps({ a: 1, b: 1, c: 1 }, { b: 2, c: 2, e: 2 }, { b: 3, c: 3, d: 3 }).should.be.deep.eq({ a: 1, b: 3, c: 3, e: 2, d: 3 });
        });

        it('should correctly merge 2 complex object props', async (): Promise<any> => {
            return mergeDeepProps({ a: { b: 1 }, c: 1, d: 1 }, { a: { b: 2 }, c: 2, e: 2 }).should.be.deep.eq({ a: { b: 2 }, c: 2, d: 1, e: 2 });
        });

        it('should correctly merge class props with simple object', async (): Promise<any> => {
            const error: Error = new Error();
            return mergeDeepProps(error, { name: 'x' })
                .should.be.instanceOf(Error)
                .and.deep.eq(error)
                .and.have.property('name', 'x');
        });
    });
});
