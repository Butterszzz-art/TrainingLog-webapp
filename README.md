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

