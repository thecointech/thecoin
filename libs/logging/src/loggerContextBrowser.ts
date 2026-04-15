import { LoggerContext } from './loggerContext';

export class BrowserLoggerContext extends LoggerContext {
    private static stack: LoggerContext[] = [];

    static {
        super.setStorage({
            getStack: () => this.stack,
            run: (fn) => fn()
        });
    }
}
