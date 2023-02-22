import type { ISquareClientConfig } from '../interface';
import { SquareClient } from './SquareClient';
export type ClassConstructor<T> = new (...args: any[]) => T;
export class SquareClientFactory {
    static create(accessToken: string, config: ISquareClientConfig = {}): SquareClient {
        return new SquareClient(accessToken, config);
    }

    create(accessToken: string, config: ISquareClientConfig = {}): SquareClient {
        return SquareClientFactory.create(accessToken, config);
    }

    static createCustomSquareClient<T extends SquareClient>(client: ClassConstructor<T>, accessToken: string, config: ISquareClientConfig = {}): T {
        return new client(accessToken, config);
    }

    createCustomSquareClient<T extends SquareClient>(client: ClassConstructor<T>, accessToken: string, config: ISquareClientConfig = {}): T {
        return SquareClientFactory.createCustomSquareClient(client, accessToken, config);
    }
}
