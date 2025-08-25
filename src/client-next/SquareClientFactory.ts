import type { ISquareClientConfig } from '../interface';
import { SquareClientNext } from './SquareClientNext';

export type ClassConstructor<T> = new (...args: any[]) => T;
export class SquareClientFactory {
    static create(accessToken: string, config: ISquareClientConfig = {}): SquareClientNext {
        return new SquareClientNext(accessToken, config);
    }

    create(accessToken: string, config: ISquareClientConfig = {}): SquareClientNext {
        return SquareClientFactory.create(accessToken, config);
    }

    static createCustomSquareClient<T extends SquareClientNext>(client: ClassConstructor<T>, accessToken: string, config: ISquareClientConfig = {}): T {
        return new client(accessToken, config);
    }

    createCustomSquareClient<T extends SquareClientNext>(client: ClassConstructor<T>, accessToken: string, config: ISquareClientConfig = {}): T {
        return SquareClientFactory.createCustomSquareClient(client, accessToken, config);
    }
}
