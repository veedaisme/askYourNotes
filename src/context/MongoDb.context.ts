import { Collection, Document } from 'mongodb';
import { DB_COLLECTION_NAME, IContextSource } from '../constants';
import OpenAIEmbedding from '../embedding/openai.embedding';
import mongoDbClient from '../mongodb/mongoClient';
import { Metadata } from '../vectorDb/vectorDb.interface';

interface IEmbeddingInput {
	query: string;
	additionalInfo: {
		userIdentifier: string;
	};
}

type MONGODB_PATH = 'noteEmbedding' | 'summaryEmbedding';

type MONGODB_INDEX = 'notesIndex';

interface IIndexInformation {
	path: MONGODB_PATH;
	embeddedIndex: MONGODB_INDEX;
}

interface IAddDocumentInput {
	document: string;
	source: IContextSource;
	type: 'text';
	customerId: string;
	summary: string;
	metadata: Metadata;
	keywords: string[];
}

export interface IQueryInput {
	query: string;
	customerId: string;
	indexInformation: IIndexInformation;
}

interface INotes {
	customerId: string;
	source: IContextSource;
	metadata: Metadata;
	summary: string;
	note: string;
	keywords: string[];
	noteEmbedding: number[];
	summaryEmbedding: number[];
	createdAt: Date;
	updatedAt: Date;
}

class MongodbContext {
	private collectionName: DB_COLLECTION_NAME;
	private kNumber = 5;
	private numCandidates = 30;
	private mongodb = mongoDbClient;
	private embedding = new OpenAIEmbedding();
	private dbName: string;
	private collectionInstance: Collection<INotes>;

	private summaryEmbedding: MONGODB_PATH = 'summaryEmbedding';

	constructor(collectionName: DB_COLLECTION_NAME, dbName: string) {
		this.collectionName = collectionName;
		this.dbName = dbName;

		const db = this.mongodb.db(this.dbName);
		this.collectionInstance = db.collection(this.collectionName);
	}

	private async getEmbedding(input: IEmbeddingInput) {
		return this.embedding.getEmbedding(
			input.query,
			input.additionalInfo.userIdentifier,
		);
	}

	protected async query(input: IQueryInput): Promise<INotes[]> {
		const { query, indexInformation, customerId } = input;

		const embedding = await this.getEmbedding({
			query,
			additionalInfo: {
				userIdentifier: customerId,
			},
		});

		const noteEmbeddingSearch = {
			$vectorSearch: {
				queryVector: embedding,
				path: indexInformation.path,
				numCandidates: this.numCandidates,
				limit: this.kNumber,
				index: indexInformation.embeddedIndex,
				filter: {
					customerId,
				},
			},
		};

		const summaryEmbeddingSearch = {
			$vectorSearch: {
				queryVector: embedding,
				path: this.summaryEmbedding,
				numCandidates: this.numCandidates,
				limit: this.kNumber,
				index: indexInformation.embeddedIndex,
				filter: {
					customerId,
				},
			},
		};

		const noteSearchPipeline: Document[] = [noteEmbeddingSearch];

		const summarySearchPipeline: Document[] = [summaryEmbeddingSearch];

		const [notesBasedOnNote, notesBasedOnSummary] = await Promise.all([
			this.collectionInstance.aggregate(noteSearchPipeline).toArray(),
			this.collectionInstance.aggregate(summarySearchPipeline).toArray(),
		]);

		const combinedNotes: INotes[] = Array.from(
			[...notesBasedOnNote, ...notesBasedOnSummary]
				.reduce((temporary, currentNote) => {
					temporary.set(currentNote._id.toString(), currentNote);
					return temporary;
				}, new Map())
				.values(),
		);

		return combinedNotes;
	}

	async addReference(input: IAddDocumentInput): Promise<void> {
		const { document, metadata, source, customerId, summary, keywords } = input;

		const [noteEmbedding, summaryEmbedding] = await Promise.all([
			this.getEmbedding({
				query: document,
				additionalInfo: {
					userIdentifier: customerId,
				},
			}),
			this.getEmbedding({
				query: summary,
				additionalInfo: {
					userIdentifier: customerId,
				},
			}),
		]);

		const result = await this.collectionInstance.insertOne({
			customerId,
			source,
			metadata,
			summary,
			note: document,
			keywords,
			noteEmbedding,
			summaryEmbedding,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		if (!result.acknowledged) {
			console.log(`Failed to inser reference. for customerId: ${customerId}`);

			return;
		}

		console.error(
			`Successfully insert a reference. for customerId: ${customerId}`,
		);
	}
}

export default MongodbContext;
