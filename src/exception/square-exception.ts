/* eslint-disable no-empty */
import { ModelError } from 'square-connect';
import type { Response, SuperAgentRequest } from 'superagent';
import { ISquareException } from './i-square-exception';

export class SquareException extends Error implements ISquareException {
    statusCode: number;
    apiError: ModelError;
    retries?: number;
    url?: string;
    method?: string;
    requestArgs?: any;
    errors?: ModelError[];

    constructor(
        data?: { retries?: number; url?: string; method?: string; statusCode?: number; apiError?: ModelError; requestArgs?: any; errors?: ModelError[] },
        originError?: Error,
    ) {
        super();

        this.name = this.constructor.name;

        this.retries = data?.retries || 0;
        this.url = data?.url;
        this.method = data?.method?.toUpperCase();
        this.statusCode = data?.statusCode || 500;
        this.apiError = data?.apiError || { category: 'API_ERROR', code: 'SERVICE_UNAVAILABLE', detail: 'Square API error' };
        this.message = this.apiError.detail ?? this.apiError.code ?? originError?.message ?? 'Square API error';
        this.requestArgs = data?.requestArgs;
        this.errors = data?.errors;

        // Error.captureStackTrace(this);
    }

    static createFromSuperAgentError(
        error: Error & { response?: Response & { request?: SuperAgentRequest }; code?: string },
        retries: number,
    ): SquareException {
        const response: (Response & { request?: SuperAgentRequest }) | undefined = error?.response;
        const request: SuperAgentRequest | undefined = response?.request;

        if (response) {
            // console.dir(request, { depth: undefined });
            // console.log(JSON.parse(JSON.stringify(response)));
            let responseBody: { errors?: ModelError[] } = response.body || {};
            if (!responseBody.errors && response.error) {
                try {
                    responseBody = JSON.parse(response.error.text);
                } catch {}
            }

            return new SquareException(
                {
                    retries,
                    url: request?.url,
                    method: request?.method,
                    statusCode: response.status,
                    apiError: responseBody.errors?.[0],
                    // @ts-ignore
                    requestArgs: request?._data,
                    errors: responseBody.errors,
                },
                error,
            );
        } else if ('ECONNABORTED' === error.code) {
            return new SquareException({
                retries,
                statusCode: 500,
                apiError: { category: 'API_ERROR', code: 'GATEWAY_TIMEOUT', detail: 'Square API timeout' },
            });
        }

        return new SquareException(
            {
                retries,
                statusCode: 500,
                apiError: { category: 'API_ERROR', code: 'SERVICE_UNAVAILABLE', detail: 'Square API error' },
            },
            error,
        );
    }

    toObject(): ISquareException {
        return {
            name: this.name,
            message: this.message,
            retries: this.retries,
            url: this.url,
            method: this.method,
            statusCode: this.statusCode,
            requestArgs: this.requestArgs,
            apiError: this.apiError,
            errors: this.errors,
        };
    }

    toString(): string {
        return JSON.stringify(this.toObject());
    }
}
