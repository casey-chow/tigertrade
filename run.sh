# Run tigertrade only if not CLIENT_MODE
[ -z "$CLIENT_MODE" ] && ./tigertrade
