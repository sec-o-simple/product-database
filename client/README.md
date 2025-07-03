# Product Database – Client

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or higher
- [NPM](https://www.npmjs.com/package/npm)

### Project setup

```sh
# Install NPM dependencies
$ npm install
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

The client can be configured using environment variables. Create a `.env.local` file in the client directory to override the default settings for local development:

```sh
VITE_API_BASE_URL=http://localhost:9999
```

**Available Environment Variables:**

- `VITE_API_BASE_URL`: The base URL of the API server
  - Default: `http://localhost:9999`

For more information on the priority of environment variable files, refer to the [Vite documentation](https://vite.dev/guide/env-and-mode.html#env-files).
