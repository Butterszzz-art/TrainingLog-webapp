# TrainingLog

This project contains a simple fitness tracker.

## Running Tests

Tests are written using [Jest](https://jestjs.io/). Install dependencies and run the test suite with:

```bash
npm install
npm test
```

## Server Configuration

`server.js` exposes a `/config` endpoint that provides the Airtable credentials. Create a `.env` file with the following variables before starting the server:

```bash
AIRTABLE_TOKEN=yourTokenHere
AIRTABLE_BASE_ID=yourBaseIdHere
```

Run the server with:

```bash
npm start
```

## Front-End Configuration

The web app reads Airtable credentials from a small `config.js` file at
runtime. Copy `config.example.js` to `config.js` and fill in your values:

```bash
cp config.example.js config.js
# edit config.js and set AIRTABLE_TOKEN and AIRTABLE_BASE_ID
```

Optionally, set `SERVER_URL` if you are running the Express backend that
exposes the `/config` route. Leaving it blank will load the credentials directly
from `config.js`.

