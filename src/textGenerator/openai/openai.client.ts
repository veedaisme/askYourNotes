import OpenAI from 'openai';
import config from '../../../config';
import IBaseLLMProcessor from '../../model/IBaseLLMProcessor';
import { OpenAIModel, OpenAIOutputFormat } from './openai.interface';

class OpenAIClient extends IBaseLLMProcessor {
	private API_KEY = config.openAIKey;
	private openai = new OpenAI({ apiKey: this.API_KEY });
	private model: OpenAIModel = 'gpt-4o-mini';
	private format: OpenAIOutputFormat = 'text';

	private config = {
		temperature: 0.85,
	};

	private maxTokenResponse: number;

	constructor({ maxTokenResponse }: { maxTokenResponse?: number } = {}) {
		super();

		this.maxTokenResponse = maxTokenResponse ?? 450;
	}

	setModel(model: OpenAIModel) {
		this.model = model;

		return this;
	}

	setOutputFormat(format: OpenAIOutputFormat) {
		this.format = format;

		return this;
	}

	async exec(): Promise<string> {
		const completion = await this.openai.chat.completions.create({
			messages: [
				this.systemQuery.toChatPrompt(),
				this.userQuery.toChatPrompt(),
			],
			model: this.model,
			temperature: this.config.temperature,
			max_tokens: this.maxTokenResponse,
			response_format: { type: this.format },
		});

		const content = completion.choices[0].message.content;

		return content as string;
	}
}

export default OpenAIClient;
