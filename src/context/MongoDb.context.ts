import { Collection, Document } from 'mongodb';
import { IContextSource, VECTOR_COLLECTION_NAME } from '../constants';
import OpenAIEmbedding from '../embedding/openai.embedding';
import mongoDbClient from '../mongodb/mongoClient';
import { Metadata } from '../vectorDb/vectorDb.interface';

interface IEmbeddingInput {
	query: string;
	additionalInfo: {
		userIdentifier: string;
	};
}

type MONGODB_PATH = 'noteEmbedding' | 'keywordEmbedding';

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

class MongodbContext {
	private collectionName: VECTOR_COLLECTION_NAME;
	private kNumber = 3;
	private numCandidates = 30;
	private mongodb = mongoDbClient;
	private embedding = new OpenAIEmbedding();
	private dbName: string;
	private collectionInstance: Collection<Document>;

	private keywordEmbeddingPath: MONGODB_PATH = 'keywordEmbedding';

	constructor(collectionName: VECTOR_COLLECTION_NAME, dbName: string) {
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

	protected async query(
		input: IQueryInput,
		projection: Document,
	): Promise<Document[]> {
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

		const keywordEmbeddingSearch = {
			$vectorSearch: {
				queryVector: embedding,
				path: this.keywordEmbeddingPath,
				numCandidates: this.numCandidates,
				limit: this.kNumber,
				index: indexInformation.embeddedIndex,
				filter: {
					customerId,
				},
			},
		};

		const noteSearchPipeline: Document[] = [noteEmbeddingSearch];

		const keywordSearchPipeline: Document[] = [keywordEmbeddingSearch];

		const [notesBasedOnNote, notesBasedOnKeyword] = await Promise.all([
			this.collectionInstance.aggregate(noteSearchPipeline).toArray(),
			this.collectionInstance.aggregate(keywordSearchPipeline).toArray(),
		]);

		const combinedNotes: Document[] = Array.from(
			[...notesBasedOnNote, ...notesBasedOnKeyword]
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

		const keywordflatten = keywords.join(' ');

		const [noteEmbedding, keywordEmbedding] = await Promise.all([
			this.getEmbedding({
				query: document,
				additionalInfo: {
					userIdentifier: customerId,
				},
			}),
			this.getEmbedding({
				query: keywordflatten,
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
			keywordEmbedding,
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
