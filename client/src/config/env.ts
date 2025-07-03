/**
 * Application configuration loaded from environment variables
 */

interface Config {
  apiBaseUrl: string
}

const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999',
}

// Validate required environment variables
if (!config.apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL environment variable is required')
}

export default config
