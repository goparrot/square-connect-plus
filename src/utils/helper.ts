import type { ObjectLikeType } from '../interface';

export type ReturnRecursiveBigIntToNumberType<T> = T extends bigint
    ? number
    : T extends ReadonlyArray<any> | ArrayLike<any> | ObjectLikeType
    ? { [key in keyof T]: ReturnRecursiveBigIntToNumberType<T[key]> }
    : T;

export function recursiveBigIntToNumber<T>(body: T): ReturnRecursiveBigIntToNumberType<T> {
    if (body === undefined || body === null || !['object', 'bigint'].includes(typeof body)) {
        return body as ReturnRecursiveBigIntToNumberType<T>;
    }

    if (typeof body === 'bigint') {
        return Number(body) as ReturnRecursiveBigIntToNumberType<T>;
    }

    for (const [key, value] of Object.entries(body)) {
        if (typeof value === 'bigint') {
            body[key] = Number(value);
            continue;
        }

        if (typeof value === 'object') {
            body[key] = recursiveBigIntToNumber(value);
        }
    }

    return body as ReturnRecursiveBigIntToNumberType<T>;
}

export type ReturnRecursiveNumberToBigIntType<T> = T extends number
    ? bigint
    : T extends ReadonlyArray<any> | ArrayLike<any> | ObjectLikeType
    ? { [key in keyof T]: ReturnRecursiveBigIntToNumberType<T[key]> }
    : T;

/* global BigInt */
export function recursiveNumberToBigInt<T>(body: T): ReturnRecursiveNumberToBigIntType<T> {
    if (body === undefined || body === null || !['object', 'number'].includes(typeof body)) {
        return body as ReturnRecursiveNumberToBigIntType<T>;
    }

    if (typeof body === 'number') {
        return BigInt(body) as ReturnRecursiveNumberToBigIntType<T>;
    }

    for (const [key, value] of Object.entries(body)) {
        if (typeof value === 'number') {
            body[key] = BigInt(value);
            continue;
        }

        if (typeof value === 'object') {
            body[key] = recursiveNumberToBigInt(value);
        }
    }

    return body as ReturnRecursiveNumberToBigIntType<T>;
}
