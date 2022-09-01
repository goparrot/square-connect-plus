import type { Error as SquareError } from 'square';
import { ApiError } from 'square';
import type { ISquareApiException } from './ISquareApiException';

export class SquareApiException extends Error implements ISquareApiException {
    readonly statusCode: number = 500;
    readonly retries: number = 0;
    readonly errors: SquareError[] = [];
    readonly apiError?: ApiError;
    readonly url?: string;
    readonly method?: string;
    readonly responseTime?: number;

    constructor(error: unknown, retries: number = 0, responseTime?: number) {
        super();
        this.message = 'Square API error';
        this.name = this.constructor.name;
        this.retries = retries ?? this.retries;

        if (responseTime) {
            this.responseTime = responseTime;
        }

        /* If timeout < 800ms square api doesn't throw ApiError, but Error */
        if (error instanceof Error) {
            this.method = error['config']?.method;
            this.url = error['config']?.url;
            this.message = error.message;
        }

        if (error instanceof ApiError) {
            delete error.request.headers?.['authorization'];

            this.apiError = error;
            this.errors = error.errors ?? this.errors;
            this.message = this.errors[0]?.detail || this.errors[0]?.code || this.message;
            this.url = error.request.url;
            this.method = error.request.method;
            this.statusCode = error.statusCode;
        }
    }

    toObject(): ISquareApiException {
        return {
            name: this.name,
            message: this.message,
            retries: this.retries,
            url: this.url,
            method: this.method,
            statusCode: this.statusCode,
            errors: this.errors,
            apiError: this.apiError,
            responseTime: this.responseTime,
        };
    }

    toString(): string {
        return JSON.stringify(this.toObject());
    }
}
