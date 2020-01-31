import { ILogger, NullLogger } from '../../../src/logger';

describe('NullLogger (unit)', (): void => {
    describe('#constructor', (): void => {
        it('should be init without args', async (): Promise<any> => {
            return new NullLogger().should.be.instanceOf(NullLogger);
        });
    });

    describe('#debug', (): void => {
        it('should have debug method', async (): Promise<any> => {
            const logger: ILogger = new NullLogger();
            return logger.debug.should.be.a('function');
        });

        it('should be ok', async (): Promise<any> => {
            const logger: ILogger = new NullLogger();
            try {
                logger.debug('test');
                return true.should.be.true;
            } catch (e) {
                return true.should.be.false;
            }
        });
    });

    describe('#info', (): void => {
        it('should have debug method', async (): Promise<any> => {
            const logger: ILogger = new NullLogger();
            return logger.info.should.be.a('function');
        });

        it('should be ok', async (): Promise<any> => {
            const logger: ILogger = new NullLogger();
            try {
                logger.info('test');
                return true.should.be.true;
            } catch (e) {
                return true.should.be.false;
            }
        });
    });

    describe('#warn', (): void => {
        it('should have warn method', async (): Promise<any> => {
            const logger: ILogger = new NullLogger();
            return logger.warn.should.be.a('function');
        });

        it('should be ok', async (): Promise<any> => {
            const logger: ILogger = new NullLogger();
            try {
                logger.warn('test');
                return true.should.be.true;
            } catch (e) {
                return true.should.be.false;
            }
        });
    });

    describe('#error', (): void => {
        it('should have error method', async (): Promise<any> => {
            const logger: ILogger = new NullLogger();
            return logger.error.should.be.a('function');
        });

        it('should be ok', async (): Promise<any> => {
            const logger: ILogger = new NullLogger();
            try {
                logger.error('test');
                return true.should.be.true;
            } catch (e) {
                return true.should.be.false;
            }
        });
    });
});
