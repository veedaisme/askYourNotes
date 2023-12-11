import OpenAI from 'openai';
import config from '../../../config';
import IBaseLLMProcessor from '../../model/IBaseLLMProcessor';
import { OpenAiModel, OpenAiOutputFormat } from './openAI.interface';

class OpenAIClient extends IBaseLLMProcessor {
	private API_KEY = config.openAIKey;
	private openai = new OpenAI({ apiKey: this.API_KEY });
	private model: OpenAiModel = 'gpt-3.5-turbo';
	private format: OpenAiOutputFormat = 'text';

	private config = {
		temperature: 0.85,
	};

	setModel(model: OpenAiModel) {
		this.model = model;

		return this;
	}

	setOutputFormat(format: OpenAiOutputFormat) {
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
			max_tokens: 450,
			response_format: { type: this.format },
		});

		const content = completion.choices[0].message.content;

		return content as string;
	}
}

export default OpenAIClient;
