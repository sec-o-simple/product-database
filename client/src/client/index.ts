import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'
import type { paths } from './schema'
import config from '../config/env'

const fetchClient = createFetchClient<paths>({
  baseUrl: config.apiBaseUrl,
})

const client = createClient(fetchClient)

export default client
