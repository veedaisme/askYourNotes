import config from "../../config";
import VectorDbClient from "./VectorDb";

const vectorDbClient = new VectorDbClient({
  embedderApiKey: config.openAIKey,
  baseUrl: config.chromaDbBaseUrl
})

export default vectorDbClient;