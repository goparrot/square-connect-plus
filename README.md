[![Build Status](https://github.com/goparrot/square-connect-plus/workflows/CI/badge.svg?branch=master)](https://github.com/goparrot/square-connect-plus/actions?query=branch%3Amaster+event%3Apush+workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/goparrot/square-connect-plus/badge.svg?branch=master)](https://coveralls.io/github/goparrot/square-connect-plus?branch=master)
[![NPM version](https://img.shields.io/npm/v/@goparrot/square-connect-plus)](https://www.npmjs.com/package/@goparrot/square-connect-plus)
[![Greenkeeper badge](https://badges.greenkeeper.io/goparrot/square-connect-plus.svg)](https://greenkeeper.io/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) 
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

# Square Connect Plus

**Square Connect Plus** is a Typescript library which extends the official Square Connect APIs library with additional functionality.
The library does not modify request and response payload.

*   [Installation](#installation)
*   [Usage](#usage)
*   [Versioning](#versioning)
*   [Contributing](#contributing)
*   [Unit Tests](#unit-tests)
*   [Background](#background)
*   [License](#license)

## Installation

    $ npm i @goparrot/square-connect-plus square-connect@4

## Usage

### Simple example

```typescript
import { SquareClient } from '@goparrot/square-connect-plus'; 
import { ListLocationsResponse } from 'square-connect';

const accessToken: string = `${process.env.SQUARE_ACCESS_TOKEN}`;
const squareClient: SquareClient = new SquareClient(accessToken);

(async () => {
    try {
        const listLocationsResponse: ListLocationsResponse = await squareClient.getLocationsApi().listLocations();
        if (listLocationsResponse.errors) {
            throw new Error(`cant fetch locations`);
        }

        console.info('locations', listLocationsResponse.locations);
    } catch (error) {
        console.error(error);
        // or error as string with stack + request and response payload
        // console.error(`${error.stack}\npayload: ${error.toString()}`);
    }
})();
```

### Advanced example

```typescript
import { SquareClient, exponentialDelay, retryCondition } from '@goparrot/square-connect-plus'; 

const accessToken: string = `${process.env.SQUARE_ACCESS_TOKEN}`;
const squareClient: SquareClient = new SquareClient(accessToken, {
    retry: {
        maxRetries: 10, 
    },
    originClient: {
        timeout: 10000,
    },
    logger: console,
});
```

## Available Options

### `retry` Options

| Name           | Type       | Default            | Description                                                                                                                                                                                                                                 |
| -------------- | ---------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| maxRetries     | `Number`   | `6`                | The number of times to retry before failing.                                                                                                                                                                                                |
| retryCondition | `Function` | `retryCondition`   | A callback to further control if a request should be retried. By default, the built-in `retryCondition` function is used.                                                                                                                   |
| retryDelay     | `Function` | `exponentialDelay` | A callback to further control the delay between retried requests. By default, the built-in `exponentialDelay` function is used ([Exponential Backoff](https://developers.google.com/analytics/devguides/reporting/core/v3/errors#backoff)). |

### `originClient` Options

A set of possible settings for the original library. 

| Name           | Type      | Default                                                      | Description                                                                                                      |
| -------------- | --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| basePath       | `String`  | `https://connect.squareup.com`                               | The base URL against which to resolve every API call's (relative) path.                                          |
| defaultHeaders | `Array`   | `{ 'User-Agent': 'Square-Connect-Javascript/3.20200226.0' }` | The default HTTP headers to be included for all API calls.                                                       |
| timeout        | `Number`  | `15000`                                                      | The default HTTP timeout for all API calls.                                                                      |
| cache          | `Boolean` | `true`                                                       | If set to false an additional timestamp parameter is added to all API GET calls to prevent browser caching.      |
| enableCookies  | `Boolean` | `false`                                                      | If set to true, the client will save the cookies from each server response, and return them in the next request. |

### `logger` Option

By default, the built-in `NullLogger` class is used.
You can use any logger that fits the built-in `ILogger` interface

## Versioning

Square Connect Plus follows [Semantic Versioning](http://semver.org/).

## Contributing

See [`CONTRIBUTING`](https://github.com/goparrot/square-connect-plus/blob/master/CONTRIBUTING.md#contributing) file.

## Unit Tests

In order to run the test suite, install the development dependencies:

    $ npm i

Then, run the following command:

    $ npm run coverage

## License

Square Connect Plus is [MIT licensed](LICENSE).
