import type { ISquareClientConfig } from '../interface';
import { LegacySquareClient } from './LegacySquareClient';

export type ClassConstructor<T> = new (...args: any[]) => T;
export class SquareClientFactory {
    static create(accessToken: string, config: ISquareClientConfig = {}): LegacySquareClient {
        return new LegacySquareClient(accessToken, config);
    }

    static createCustomSquareClient<T extends LegacySquareClient>(client: ClassConstructor<T>, accessToken: string, config: ISquareClientConfig = {}): T {
        return new client(accessToken, config);
    }

    create(accessToken: string, config: ISquareClientConfig = {}): LegacySquareClient {
        return SquareClientFactory.create(accessToken, config);
    }

    createCustomSquareClient<T extends LegacySquareClient>(client: ClassConstructor<T>, accessToken: string, config: ISquareClientConfig = {}): T {
        return SquareClientFactory.createCustomSquareClient(client, accessToken, config);
    }
}
