import OpenAI from 'openai';
import config from '../../config';

class OpenAiEmbedding {
	private openai = new OpenAI({ apiKey: config.openAIKey });
	private embeddingModel = {
		ada: {
			model: 'text-embedding-ada-002',
			dimension: 1536,
		},
	};

	async getEmbedding(text: string, userIdentifier: string) {
		let embedding;

		try {
			embedding = await this.openai.embeddings.create({
				model: this.embeddingModel.ada.model,
				input: text,
				encoding_format: 'float',
				user: userIdentifier,
			});

			return embedding.data[0].embedding;
		} catch (error) {
			throw Error(`OpenAI Embedding Error: ${error}`);
		}
	}
}

export default OpenAiEmbedding;
