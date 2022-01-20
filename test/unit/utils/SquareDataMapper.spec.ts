import * as assert from 'assert'; // Node.js
import type { Order, OrderLineItem, PublishInvoiceRequest } from 'square';
// eslint-disable-next-line import/no-unresolved
import type { Order as SquareConnectOrder, PublishInvoiceRequest as SquareConnectPublishInvoiceRequest } from 'square-connect';
import { recursiveNumberToBigInt, SquareDataMapper } from '../../../src';

describe('SquareDataMapper', () => {
    describe('#toOldFormat', () => {
        it('should convert to old format', () => {
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

            const orderWithOldFormat: SquareConnectOrder = {
                location_id: 'locationId',
                line_items: [
                    {
                        name: 'Coca-cola',
                        quantity: '1',
                        base_price_money: {
                            amount: 100,
                            currency: 'USD',
                        },
                    },
                ],
            };

            SquareDataMapper.toOldFormat<SquareConnectOrder>(order).should.deep.equals(orderWithOldFormat);
        });

        it('should convert to old format preserve big int', () => {
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
            const { line_items, location_id } = SquareDataMapper.toOldFormat<SquareConnectOrder>(order, false);
            location_id!.should.equal(order.locationId);
            const { base_price_money, name, quantity } = line_items![0];
            name!.should.be.equal(order.lineItems?.[0]?.name);
            quantity.should.be.equal(order.lineItems?.[0]?.quantity);

            assert.strictEqual(base_price_money!.amount, recursiveNumberToBigInt(100));
        });
    });

    describe('#toNewFormat', () => {
        it('should convert to new format', () => {
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

            const orderWithOldFormat: SquareConnectOrder = {
                location_id: 'locationId',
                line_items: [
                    {
                        name: 'Coca-cola',
                        quantity: '1',
                        base_price_money: {
                            amount: 100,
                            currency: 'USD',
                        },
                    },
                ],
            };

            SquareDataMapper.toNewFormat<SquareConnectOrder>(orderWithOldFormat, false).should.deep.equals({
                ...order,
                lineItems: [{ ...order.lineItems![0], basePriceMoney: { ...order.lineItems![0].basePriceMoney, amount: 100 } }],
            });
        });

        it('should convert to new format preserve big int', () => {
            const orderWithOldFormat: SquareConnectOrder = {
                location_id: 'locationId',
                line_items: [
                    {
                        name: 'Coca-cola',
                        quantity: '1',
                        base_price_money: {
                            amount: 100,
                            currency: 'USD',
                        },
                    },
                ],
            };

            const { lineItems, locationId } = SquareDataMapper.toNewFormat<Order>(orderWithOldFormat);
            locationId.should.equal(orderWithOldFormat.location_id);
            const { basePriceMoney, name, quantity }: OrderLineItem = lineItems![0];
            name!.should.be.equal(orderWithOldFormat.line_items?.[0]?.name);
            quantity.should.be.equal(orderWithOldFormat.line_items?.[0]?.quantity);

            assert.strictEqual(basePriceMoney!.amount, recursiveNumberToBigInt(100));
        });
    });

    describe('#idempotencyFree', () => {
        it('should return new object without idempotencyFree', () => {
            const publishInvoiceRequest: PublishInvoiceRequest = {
                version: 1,
                idempotencyKey: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
            };
            SquareDataMapper.idempotencyFree(publishInvoiceRequest).should.deep.equal({
                version: 1,
            });
        });

        it('should return new object without idempotency_key', () => {
            const publishInvoiceRequest: SquareConnectPublishInvoiceRequest = {
                version: 1,
                idempotency_key: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
            };
            SquareDataMapper.idempotencyFree(publishInvoiceRequest).should.deep.equal({
                version: 1,
            });
        });
    });
});
