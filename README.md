# TigerTrade
TigerTrade Revised - Princeton COS333 Project of Andrew Casey Evan Maryam Perry

Deploy locally: heroku local

Push to heroku: git push heroku master

# Running

This assumes you have initialized and migrated the database.

```sh
make install
make run
```

Go to [localhost:9000][].

# Development

For dependency management, we use
[govendor](https://github.com/kardianos/govendor). Their documentation isn't
all that clear, so here's  a quick cheat sheet of relevant commands:

```
govendor fetch <github_url>     Installs a package into the vendor folder.
govendor sync                   Downloads all indicated dependencies.
govendor list                   List all installed packages
```

## Stack

- Go [Language]
- Postgres [Database]
- Revel [Web Framework]
- Sentry [Error Reporting]

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
conf/             Configuration directory
    app.conf      Main app configuration file
    routes        Routes definition file

app/              App sources
    init.go       Interceptor registration
    controllers/  App controllers go here
    views/        Templates directory

messages/         Message files

public/           Public static assets
    css/          CSS files
    js/           Javascript files
    images/       Image files

tests/            Test suites
```

