[![Build Status](https://github.com/goparrot/square-connect-plus/workflows/CI/badge.svg?branch=master)](https://github.com/goparrot/square-connect-plus/actions?query=branch%3Amaster+event%3Apush+workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/goparrot/square-connect-plus/badge.svg?branch=master)](https://coveralls.io/github/goparrot/square-connect-plus?branch=master)
[![NPM version](https://img.shields.io/npm/v/@goparrot/square-connect-plus)](https://www.npmjs.com/package/@goparrot/square-connect-plus)
[![Greenkeeper badge](https://badges.greenkeeper.io/goparrot/square-connect-plus.svg)](https://greenkeeper.io/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

# Square Connect Plus

**Square Connect Plus** is a Typescript library which extends the official Square Node.js SDK library with additional functionality.
The library does not modify request and response payload.

-   [Installation](#installation)
-   [Usage](#usage)
-   [Versioning](#versioning)
-   [Contributing](#contributing)
-   [Unit Tests](#unit-tests)
-   [Background](#background)
-   [License](#license)

## Installation

    $ npm i @goparrot/square-connect-plus square@17.0.0

## Usage

### Simple example

```typescript
import { SquareClient } from '@goparrot/square-connect-plus';
import { ListLocationsResponse } from 'square';

const accessToken: string = `${process.env.SQUARE_ACCESS_TOKEN}`;
const squareClient: SquareClient = new SquareClient(accessToken);

(async () => {
    try {
        const listLocationsResponse: ListLocationsResponse = await squareClient.getLocationsApi().listLocations();
        if (listLocationsResponse.errors.length) {
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
    configuration: {
        timeout: 60_000,
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

| Name              | Type     | Default                        | Description                                                               |
| ----------------- | -------- | ------------------------------ | ------------------------------------------------------------------------- |
| customUrl         | `String` | `https://connect.squareup.com` | The custom URL against which to resolve every API call's (relative) path. |
| additionalHeaders | `Object` | `{}`                           | Record<string, string>                                                    |
| timeout           | `Number` | `60_000`                       | The default HTTP timeout for all API calls.                               |
| squareVersion     | `String` | `2021-12-15`                   | The default square api version for all API calls.                         |
| environment       | `Enum`   | `Environment.Production`       | The default square enviroment for all API calls.                          |
| accessToken       | `String` | `''`                           | Scoped access token.                                                      |

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
