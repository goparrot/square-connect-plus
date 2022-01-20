import type { ISquareClientConfig } from '../interface';
import { SquareClient } from './SquareClient';

export class SquareClientFactory {
    static create(accessToken: string, config: ISquareClientConfig = {}): SquareClient {
        return new SquareClient(accessToken, config);
    }

    create(accessToken: string, config: ISquareClientConfig = {}): SquareClient {
        return SquareClientFactory.create(accessToken, config);
    }
}
