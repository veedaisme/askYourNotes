import config from "../../config";
import VectorDbClient from "./VectorDb";

const vectorDbBaseUrl = config.chromaDbBaseUrl;

console.info(`[INFO] Connecting to vector db at ${vectorDbBaseUrl}`)

const vectorDbClient = new VectorDbClient({
  embedderApiKey: config.openAIKey,
  baseUrl: vectorDbBaseUrl
})

export default vectorDbClient;