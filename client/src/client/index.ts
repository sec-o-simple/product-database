import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./schema";

const fetchClient = createFetchClient<paths>({
  baseUrl: "http://localhost:9999/",
});

const client = createClient(fetchClient);

export default client;