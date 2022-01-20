import snakeCase from 'lodash.snakecase';
import camelCase from 'lodash.camelcase';
import type { ObjectLikeType } from '../interface';
import { isObject } from './common.utils';
import { recursiveBigIntToNumber, recursiveNumberToBigInt } from './helper';

export type IdempotencyFree<T> = Omit<T, 'idempotency_key' | 'idempotencyKey'>;

export class SquareDataMapper {
    /**
     *
     * @param data
     * @param recursiveReplaceBigInToNumber @default true
     * @returns {T}
     */
    static toOldFormat = <T extends ObjectLikeType>(data: ObjectLikeType, recursiveReplaceBigInToNumber: boolean = true): T => {
        const object: T = SquareDataMapper.convert(data, snakeCase);

        if (recursiveReplaceBigInToNumber) {
            return recursiveBigIntToNumber(object) as T;
        }

        return object;
    };

    /**
     * @param recursiveReplaceNumberToBigInt @default false
     * @returns {T}
     */
    static toNewFormat = <T extends ObjectLikeType>(data: ObjectLikeType, recursiveReplaceNumberToBigInt: boolean = true): T => {
        const object: T = SquareDataMapper.convert(data, camelCase);

        if (recursiveReplaceNumberToBigInt) {
            return recursiveNumberToBigInt(object) as T;
        }

        return object;
    };

    static idempotencyFree = <T extends ObjectLikeType>(data: T): IdempotencyFree<T> => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { idempotency_key, idempotencyKey, ...dataWithoutIdempotenceKey } = data;

        return dataWithoutIdempotenceKey;
    };

    protected static convert = <T, O = ObjectLikeType>(data: T, transformer: (value: string) => string): O => {
        const isUntouchable = <T>(value: T): boolean => value instanceof Date;
        const convertObject = <T, O>(value: T): O => SquareDataMapper.convert(value, transformer);
        const convertArray = <T, O>(value: T[]): O[] =>
            value.map((val) => {
                return SquareDataMapper.convert(val, transformer);
            });
        const transformableObject = <T>(value: T): boolean => isObject(value) && !isUntouchable(value);

        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => {
                return Array.isArray(value)
                    ? [transformer(key), convertArray(value)]
                    : [transformer(key), transformableObject(value) ? convertObject(value) : value];
            }),
        ) as O;
    };
}
