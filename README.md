# TigerTrade [![Build Status](https://travis-ci.com/casey-chow/tigertrade.svg?token=n7qYoTpmELGRfaEv2AM7&branch=master)](https://travis-ci.com/casey-chow/tigertrade)

The Princeton COS333 Project of Andrew Casey Evan Maryam Perry.

# Running the server

This assumes you have initialized and migrated the database, and have Go and NPM installed.

## NOTE: Before attempting to run the server, copy .env.example to .env and fill it out with your proper database url.
(ours is in the drive)

```sh
make install
make serve
```

Go to [http://localhost:3000][].

# Running the client

For development purposes, we've disabled server-side rendering. Re-enable it in `client/bin/server.js`:
```
global.__DISABLE_SSR___ = true;
```

Build and run with
```
yarn install
yarn run dev
```

# Development

**Server**

```
make install                    Install all dependencies
make build                      Builds the server
make serve                      Runs a hot-reloading server for development
make test                       Runs the test suite
make test-server                Runs a pretty testing server
```

**Client**
```
yarn start                      Runs an auto-reloading dev server
yarn build                      Builds the client code
yarn test                       Runs the test suite
```

**Both**
```
make clean                      Removes all temporary files
make purge                      Uninstalls all dependencies, removes temp files
```

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
    - `create-react-app` for boilerplate

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
client/             client code
server/             server code
node_modules/       Javascript dependencies
vendor/             Go dependencies
```

