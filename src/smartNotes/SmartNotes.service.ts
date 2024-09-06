import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import config from '../../config';
import Assistant from '../assistant/Assistant';
import { IContextSource } from '../constants';
import SystemQuery from '../model/SystemQuery';
import UserQuery from '../model/UserQuery';
import OpenAIClient from '../textGenerator/openai/openai.client';
import { Metadata } from '../vectorDb/vectorDb.interface';
import SmartNotesContext from './SmartNotesContext.service';
import { ISeamlessResponse, ISmartNotesService } from './smartNotes.interface';
import SmartNotesUtils from './SmartNotes.utils';

dayjs.extend(utc);
dayjs.extend(timezone);

class SmartNotesService implements ISmartNotesService {
	private contextService: SmartNotesContext;
	private llmProcessor: OpenAIClient;

	constructor() {
		this.contextService = new SmartNotesContext();
		this.llmProcessor = new OpenAIClient();
	}

	async addNote(
		note: string,
		identifier: string,
		source: IContextSource,
		metadata: Metadata,
	) {
		const { summary, keywords } = await this.summarize(note);

		const enrichedNote = SmartNotesUtils.enrichNotesWithMetadata(note);

		await this.contextService.addReference({
			source,
			summary,
			document: enrichedNote,
			type: 'text',
			metadata: metadata,
			customerId: identifier,
			keywords: keywords,
		});
	}

	private async isQuestion(query: string) {
		const userQuery = new UserQuery(query);

		const systemQuery = new SystemQuery(
			`you are very good at distinguishing whether an input is a question.

      if the input is a question, respond with "yes"
      if the input is not a question, respond with "no"
      if the input is a conversation respond with "no"`,
		);

		const answer = await this.llmProcessor
			.setSystemQuery(systemQuery)
			.setUserQuery(userQuery)
			.exec();

		return answer.toLowerCase() === 'yes';
	}

	async summarize(query: string) {
		const userQuery = new UserQuery(query).wrapWith('"""');

		const systemQuery = new SystemQuery(
			`
      1. Generate a concise summary of the text delimited by triple quotes 
      2. Decontextualize the summary by adding necessary modifiers to nouns or entire sentences
      and replacing pronouns (e.g., "it", "he", "she", "they", "this", "that") with the full name of the
      entities they refer to
      3. change "the speaker" nouns to "I"
      4. based on the keywords build a list of keywords
      5. Present the results as a JSON string consisting of summary and keywords.`,
		);

		const summaryLlmProcessor = new OpenAIClient();
		const answer = await summaryLlmProcessor
			.setSystemQuery(systemQuery)
			.setUserQuery(userQuery)
			.setModel('gpt-3.5-turbo-1106')
			.setOutputFormat('json_object')
			.exec();

		let summary;

		try {
			summary = JSON.parse(answer);
		} catch (error) {
			console.warn(
				`failed on parsing summary from json with answer: ${answer}`,
			);
			summary = {
				summary: query,
				keywords: [],
			};
		}

		return summary;
	}

	/**
	 * ask notes with assistant API
	 * support chat history context
	 * @param {UserQuery} userQuery
	 */
	private async askNoteV2(userQuery: UserQuery, identifier: string) {
		const assistant = new Assistant(config.askYourNotesAssistantId);

		await assistant.createThread({
			userIdentifier: identifier,
		});

		await assistant.createMessage(userQuery);

		return await assistant.exec();
	}

	/**
	 * ask notes with chat generator api
	 * @param {UserQuery} userQuery
	 */
	private async askNoteV1(userQuery: UserQuery) {
		const systemQuery = new SystemQuery(
			`you are an advanced Notes assistant AI
      
      - your capabilities include but are not limited to advanced reasoning, truthfulness, deep knowledge of advanced topics
      - the user is the owner of the note
      - you should response concisely based on the query
      - by default, you should respond based on the provided note delimited by triple quotes
      - you are also capable of carrying on a conversation
      - the current date is ${dayjs().tz('Asia/Jakarta').format('DD MMMM YYYY')}
      - the current time is ${dayjs().tz('Asia/Jakarta').format('HH:mm')}
      - when you don't know the answer or aren't sure you should indicate this to the user, be truthful.
      `,
		);

		const answer = await this.llmProcessor
			.setSystemQuery(systemQuery)
			.setUserQuery(userQuery)
			.exec();

		return answer;
	}

	async askNote(query: string, identifier: string): Promise<string> {
		const contextQuery = await this.summarize(query);

		const context = await this.contextService.ask({
			query: contextQuery.summary,
			customerId: identifier,
		});

		const userQuery = new UserQuery(query).withContext(context);

		if (config.isChatV2) {
			return this.askNoteV2(userQuery, identifier);
		}

		return this.askNoteV1(userQuery);
	}

	async seamless(
		query: string,
		identifier: string,
		source: IContextSource,
	): Promise<ISeamlessResponse> {
		const isQuestion = await this.isQuestion(query);

		if (isQuestion) {
			const answer = await this.askNote(query, identifier);

			return {
				answer,
				isSaveNote: false,
			};
		}

		await this.addNote(query, identifier, source, {});

		return {
			isSaveNote: true,
			answer: query,
		};
	}
}

export default SmartNotesService;
