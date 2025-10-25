/**
 * Simple logger utility
 * Provides consistent logging across the application
 */

enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

class Logger {
    private getTimestamp(): string {
        return new Date().toISOString();
    }

    private log(level: LogLevel, message: string, ...args: any[]): void {
        const timestamp = this.getTimestamp();
        const prefix = `[${timestamp}] [${level}]`;

        switch (level) {
            case LogLevel.ERROR:
                console.error(prefix, message, ...args);
                break;
            case LogLevel.WARN:
                console.warn(prefix, message, ...args);
                break;
            case LogLevel.DEBUG:
                if (process.env.NODE_ENV === 'development') {
                    console.debug(prefix, message, ...args);
                }
                break;
            default:
                console.log(prefix, message, ...args);
        }
    }

    public debug(message: string, ...args: any[]): void {
        this.log(LogLevel.DEBUG, message, ...args);
    }

    public info(message: string, ...args: any[]): void {
        this.log(LogLevel.INFO, message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this.log(LogLevel.WARN, message, ...args);
    }

    public error(message: string, ...args: any[]): void {
        this.log(LogLevel.ERROR, message, ...args);
    }
}

export const logger = new Logger();