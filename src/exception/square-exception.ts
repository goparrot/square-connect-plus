import { ModelError } from 'square-connect';
import { Response, SuperAgentRequest } from 'superagent';

export class SquareException extends Error {
    retries?: number;
    url?: string;
    method?: string;
    statusCode: number;
    apiError: ModelError;
    requestArgs?: any;

    constructor(
        data?: { retries?: number; url?: string; method?: string; statusCode?: number; apiError?: ModelError; requestArgs?: any },
        originError?: Error,
    ) {
        super();

        this.name = this.constructor.name;

        this.retries = data?.retries || 0;
        this.url = data?.url;
        this.method = data?.method?.toUpperCase();
        this.statusCode = data?.statusCode || 500;
        this.apiError = data?.apiError || { category: 'API_ERROR', code: 'SERVICE_UNAVAILABLE', detail: 'Square API error' };
        this.message = this.apiError?.detail ?? this.apiError.code ?? originError?.message ?? 'Square API error';
        this.requestArgs = data?.requestArgs;

        // Error.captureStackTrace(this);
    }

    static createFromSuperAgentError(
        error: Error & { response?: Response & { request?: SuperAgentRequest }; code?: string },
        retries: number,
    ): SquareException {
        const response: (Response & { request?: SuperAgentRequest }) | undefined = error?.response;
        const request: SuperAgentRequest | undefined = response?.request;

        if (response) {
            // console.dir(request, {depth: undefined});
            // console.log(JSON.parse(JSON.stringify(response)));
            return new SquareException(
                {
                    retries,
                    url: request?.url,
                    statusCode: response?.status,
                    method: request?.method,
                    apiError: response?.body?.errors?.[0],
                    // @ts-ignore
                    requestArgs: request?._data,
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

    toString(): string {
        return JSON.stringify({
            retries: this.retries,
            url: this.url,
            method: this.method,
            statusCode: this.statusCode,
            requestArgs: this.requestArgs,
            apiError: this.apiError,
        });
    }
}
