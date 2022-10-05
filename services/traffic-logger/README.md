# traffic logger

Send traffic logs to logs.io for each request

## Side effects

- Add request ID to each request
- Cache everything for 600 seconds \*TBC
- Add some response headers for browser security and observability
- Add server timing and caching headers

# Deploy strategy

- `main` branch is deployed to `traffic-logger`
- side branches is deployed to `traffic-logger-canary`
