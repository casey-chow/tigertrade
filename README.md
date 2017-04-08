# TigerTrade [![Build Status](https://travis-ci.com/casey-chow/tigertrade.svg?token=n7qYoTpmELGRfaEv2AM7&branch=master)](https://travis-ci.com/casey-chow/tigertrade)

The Princeton COS333 Project of Andrew Casey Evan Maryam Perry.

# Running

This assumes you have initialized and migrated the database, and have Go and NPM installed.

```sh
make install
make serve
```

Go to [http://localhost:3000][].

# Development

For dependency management, we use
[govendor](https://github.com/kardianos/govendor). Their documentation isn't
all that clear, so here's  a quick cheat sheet of relevant commands:

```
govendor fetch [github_url]     Installs a package into the vendor folder.
govendor sync                   Downloads all indicated dependencies.
govendor list                   List all installed packages
```

## Stack

- Go [Language]
    - `net/http` [Web Server]
- Postgres [Database]
- Sentry [Error Reporting]
- React [Frontend]

## Sentry

We use Sentry to track errors. If you would like this, set the `SENTRY_DSN`
environment variable.

In Go:

```go
import "github.com/getsentry/raven-go"
_, err := DoSomeOperation()
if err != nil {
    raven.CaptureError(err, nil)
    log.Warning(err)
}
```

In Javascript:

```js
import raven from 'raven-js';

callback(function(err, res) {
    if (err) {
        raven.captureException(err);
    }
});
```


## Code Layout

```
server/             server code
vendor/             Go dependencies
runner.conf         configuration for fresh
Procfile            configuration for Heroku runs
```

