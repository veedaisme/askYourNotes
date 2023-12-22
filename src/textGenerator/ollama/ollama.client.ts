import axios from 'axios';
import config from '../../../config';
import IBaseLLMProcessor from '../../model/IBaseLLMProcessor';
import { OLLAMA_MODEL } from './ollama.contants';

class OllamaClient extends IBaseLLMProcessor {
	private model: string = OLLAMA_MODEL.OPENHERMES_MISTRAL;
	private timeout = 60000;
	private completionPath = '/api/generate';

	baseUrl: string = config.ollamaBaseUrl;

	constructor(model?: OLLAMA_MODEL) {
		super();

		if (model) {
			this.model = model;
		}
	}

	async exec(): Promise<string> {
		if (!this.userQuery) {
			throw new Error('User query is not set');
		}

		const payload = {
			model: this.model,
			prompt: this.userQuery.getQuery(),
			options: {
				temperature: 0.7,
			},
			system: this.systemQuery.getQuery(),
			stream: false,
		};

		const url = `${this.baseUrl}${this.completionPath}`;

		let apiResponse;

		try {
			apiResponse = await axios.post(url, payload, {
				timeout: this.timeout,
			});
		} catch (error) {
			// TODO(fakhri): handle unexpected error from lmstudio huggingface
			console.log(error);

			throw error;
		}

		const content = apiResponse.data.response;

		return content;
	}
}

export default OllamaClient;
