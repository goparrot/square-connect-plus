import assert from 'assert';
import { expect } from 'chai';
import type { Order } from 'square';
import type { ObjectLikeType } from '../../../src';
import { recursiveBigIntToNumber, recursiveNumberToBigInt } from '../../../src';

describe('helper', () => {
    describe('#recursiveBigIntToNumber', () => {
        it('should convert bigint to number', () => {
            recursiveBigIntToNumber(1n).should.be.equal(1);
        });

        it('should convert all object property with type bigint to number', () => {
            const order: Order = {
                locationId: 'locationId',
                lineItems: [
                    {
                        name: 'Coca-cola',
                        quantity: '1',
                        basePriceMoney: {
                            amount: recursiveNumberToBigInt(100),
                            currency: 'USD',
                        },
                    },
                ],
            };

            const orderWithConvertedBigintToNumber: Order = {
                locationId: 'locationId',
                lineItems: [
                    {
                        name: 'Coca-cola',
                        quantity: '1',
                        basePriceMoney: {
                            // @ts-ignore
                            amount: 100,
                            currency: 'USD',
                        },
                    },
                ],
            };

            recursiveBigIntToNumber(order).should.be.deep.equal(orderWithConvertedBigintToNumber);
        });

        it('should be ok with undefined', () => {
            expect(recursiveBigIntToNumber(undefined)).to.be.undefined;
        });

        it('should be ok with null', () => {
            expect(recursiveBigIntToNumber(null)).to.be.null;
        });

        it('should be ok if object include null property', () => {
            const order: ObjectLikeType = {
                locationId: null,
                lineItems: [
                    {
                        name: null,
                        quantity: '1',
                        basePriceMoney: {
                            amount: null,
                            currency: 'USD',
                        },
                    },
                ],
            };
            recursiveBigIntToNumber(order).should.deep.equals(order);
        });

        it('should be ok 0 bigint', () => {
            recursiveBigIntToNumber(0n).should.be.equal(0);
        });
    });

    describe('#recursiveNumberToBigInt', () => {
        it('should convert number to bigint', () => {
            assert.strictEqual(recursiveNumberToBigInt(1), 1n);
        });

        it('should convert all object property with type num to big int', () => {
            const object: ObjectLikeType = {
                locationId: 1,
                lineItems: [
                    {
                        name: 'Coca-cola',
                        quantity: 2,
                        basePriceMoney: {
                            // @ts-ignore
                            amount: 100,
                            currency: 'USD',
                        },
                    },
                ],
            };
            const { locationId, lineItems } = recursiveNumberToBigInt(object);
            const { quantity, basePriceMoney } = lineItems[0];

            assert.strictEqual(locationId, 1n);
            assert.strictEqual(quantity, 2n);
            assert.strictEqual(basePriceMoney.amount, 100n);
        });

        it('should be ok with undefined', () => {
            expect(recursiveNumberToBigInt(undefined)).to.be.undefined;
        });

        it('should be ok with null', () => {
            expect(recursiveNumberToBigInt(null)).to.be.null;
        });

        it('should be ok with 0', () => {
            assert.strictEqual(recursiveNumberToBigInt(0), 0n);
        });

        it('should be ok of object include null property', () => {
            const order: ObjectLikeType = {
                locationId: null,
                lineItems: [
                    {
                        name: null,
                        quantity: '1',
                        basePriceMoney: {
                            amount: null,
                            currency: 'USD',
                        },
                    },
                ],
            };
            recursiveNumberToBigInt(order).should.deep.equals(order);
        });
    });
});
