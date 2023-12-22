import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Collection } from 'mongodb';
import { OpenAI } from 'openai';
import { sleep } from 'openai/core';
import { MessageContentText } from 'openai/resources/beta/threads/messages/messages';
import config from '../../config';
import { DB_COLLECTION_NAME } from '../constants';
import IQuery from '../model/IQuery';
import mongoDbClient from '../mongodb/mongoClient';

dayjs.extend(utc);
dayjs.extend(timezone);

interface IUserThreads {
	customerId: string;
	threadId: string;
}

class Assistant {
	private dbClient = mongoDbClient;

	private openAI: OpenAI;
	private assistantId: string;

	private assistant!: OpenAI.Beta.Assistants.Assistant;
	private thread!: OpenAI.Beta.Threads.Thread;
	private message!: OpenAI.Beta.Threads.Messages.ThreadMessage;
	private run!: OpenAI.Beta.Threads.Runs.Run;
	userThreadsCollection: Collection<IUserThreads>;

	constructor(assistantId: string) {
		this.assistantId = assistantId;
		this.openAI = new OpenAI({ apiKey: config.openAIKey });

		this.userThreadsCollection = this.dbClient
			.db('note_db')
			.collection(DB_COLLECTION_NAME.USER_THREADS);

		this.init();
	}

	private async init() {
		this.assistant = await this.openAI.beta.assistants.retrieve(
			this.assistantId,
		);
	}

	async createThread({ userIdentifier }: { userIdentifier: string }) {
		const customerThreadId = await this.userThreadsCollection.findOne({
			customerId: userIdentifier,
		});

		if (!customerThreadId) {
			const thread = await this.openAI.beta.threads.create();
			await this.userThreadsCollection.insertOne({
				customerId: userIdentifier,
				threadId: thread.id,
			});

			this.thread = thread;

			return;
		}

		this.thread = await this.openAI.beta.threads.retrieve(
			customerThreadId.threadId,
		);

		console.log(`threadId: ${this.thread.id}`);

		return this;
	}

	async createMessage(userQuery: IQuery) {
		this.message = await this.openAI.beta.threads.messages.create(
			this.thread.id,
			{
				role: 'user',
				content: userQuery.query,
			},
		);

		return this;
	}

	async exec(): Promise<string> {
		this.run = await this.openAI.beta.threads.runs.create(this.thread.id, {
			assistant_id: this.assistant.id,
			instructions: `you are an advanced Notes assistant AI
      
        - your capabilities include but are not limited to advanced reasoning, truthfulness, deep knowledge of advanced topics
        - the user is the owner of the note
        - you should response concisely based on the query
        - by default, you should respond based on the provided note delimited by triple quotes
        - you are also capable of carrying on a conversation
        - the current date is ${dayjs()
					.tz('Asia/Jakarta')
					.format('DD MMMM YYYY')}
        - the current time is ${dayjs().tz('Asia/Jakarta').format('HH:mm')}
        - when you don't know the answer or aren't sure you should indicate this to the user, be truthful.
        `,
		});

		let runStatus = this.run.status;

		let answer = 'Failed to answer your question. Please try again.';

		while (runStatus !== 'completed') {
			await sleep(2000);

			this.run = await this.openAI.beta.threads.runs.retrieve(
				this.thread.id,
				this.run.id,
			);

			runStatus = this.run.status;

			if (['cancelled', 'failed', 'expired'].includes(runStatus)) {
				break;
			}
		}

		const messages = await this.openAI.beta.threads.messages.list(
			this.thread.id,
		);

		const runMessage = messages.data
			.filter(
				(message) =>
					message.run_id === this.run.id && message.role === 'assistant',
			)
			.pop();

		answer =
			(runMessage?.content[0] as MessageContentText)?.text.value ?? answer;

		return answer;
	}
}

export default Assistant;
