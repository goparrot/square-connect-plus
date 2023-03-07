import { mergeDeepProps } from '../../../src';

describe('common.utils (unit)', () => {
    describe('#mergeDeepProps', () => {
        it('should correctly merge simple object with undefined', () => {
            // @ts-ignore
            mergeDeepProps({ a: 1 }, undefined).should.be.deep.eq({ a: 1 });
        });

        it('should correctly merge class props with undefined', () => {
            const error: Error = new Error();
            // @ts-ignore
            mergeDeepProps(error, undefined).should.be.instanceOf(Error).and.deep.eq(error).and.have.property('name', 'Error');
        });

        it('should correctly merge 2 empty objects', () => {
            mergeDeepProps({}, {}).should.be.deep.eq({});
        });

        it('should correctly merge 2 simple object props', () => {
            mergeDeepProps({ a: 1, b: 1, c: 1 }, { b: 2, c: 2, e: 2 }).should.be.deep.eq({ a: 1, b: 2, c: 2, e: 2 });
        });

        it('should correctly merge 3 simple objects props', () => {
            mergeDeepProps({ a: 1, b: 1, c: 1 }, { b: 2, c: 2, e: 2 }, { b: 3, c: 3, d: 3 }).should.be.deep.eq({ a: 1, b: 3, c: 3, e: 2, d: 3 });
        });

        it('should correctly merge 2 complex object props', () => {
            mergeDeepProps({ a: { b: 1 }, c: 1, d: 1 }, { a: { b: 2 }, c: 2, e: 2 }).should.be.deep.eq({ a: { b: 2 }, c: 2, d: 1, e: 2 });
        });

        it('should correctly merge class props with simple object', () => {
            const error: Error = new Error();
            mergeDeepProps(error, { name: 'x' }).should.be.instanceOf(Error).and.deep.eq(error).and.have.property('name', 'x');
        });
    });
});
