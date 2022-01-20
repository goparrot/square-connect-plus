import type { ILogger } from './ILogger';

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
