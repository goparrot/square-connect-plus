import { ILogger } from './i-logger';

export class NullLogger implements ILogger {
    debug(): any {
        //
    }

    info(): any {
        //
    }

    warn(): any {
        //
    }

    error(): any {
        //
    }
}
