# Product Database – Client

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or higher
- [NPM](https://www.npmjs.com/package/npm)

### Project setup

```sh
# Install NPM dependencies
$ npm install

# Copy .env.sample to .env and edit as needed
$ cp .env.sample .env
```

### Run server

```sh
# Start vite development server
$ npm run dev
```

The webapp is now accessible at [http://localhost:8080](http://localhost:8080)

### Testing

```sh
# Run automated tests
$ npm test
```

### Configuration

**Available Environment Variables:**

- `VITE_API_BASE_URL`: The base URL of the API server
  - Default: `http://localhost:9999`

For more information on the priority of environment variable files, refer to the [Vite documentation](https://vite.dev/guide/env-and-mode.html#env-files).
