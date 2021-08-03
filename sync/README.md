# Piikki cache API

This app caches finnish covid-19 vaccine data to its own database and serverse that data from there as an api.

## Development

- `yarn`
- Set up a postgresql database.
- Set environment variables `DATA_SYNC_TOKEN=<token for datasync endpoint>`, `DB_URL=<url to postgresql db>`
- `yarn start-dev`
- Run `curl -X PUT http://localhost:4000/syncData -H "x-token: <token for datasync endpoint>`

## Public endpoints

### GET

- https://piikki-api.lab.juiciness.io/administrations
- https://piikki-api.lab.juiciness.io/summary
