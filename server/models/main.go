package models

import (
	sq "github.com/Masterminds/squirrel"
)

// Postgres Statement Builder instance
var psql = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
