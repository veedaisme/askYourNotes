import config from '../../config';
import VectorDbClient from './VectorDbClient';

const vectorDbBaseUrl = config.chromaDbBaseUrl;

console.info(`[INFO] Connecting to vector db at ${vectorDbBaseUrl}`);
console.info(`[INFO] openai api key ${config.openAIKey}`);

const vectorDbClient = new VectorDbClient({
	embedderApiKey: config.openAIKey,
	baseUrl: vectorDbBaseUrl,
});

export default vectorDbClient;
