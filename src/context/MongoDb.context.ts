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

type MONGODB_PATH = 'noteEmbedding';

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
}

export interface IQueryInput {
	query: string;
	customerId: string;
	indexInformation: IIndexInformation;
}

class MongodbContext {
	private collectionName: VECTOR_COLLECTION_NAME;
	private kNumber = 2;
	private mongodb = mongoDbClient;
	private embedding = new OpenAIEmbedding();
	private dbName: string;
	private collectionInstance: Collection<Document>;

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

		const aggregatePipeline: Document[] = [
			// vector search only valid as the first stage of pipeline
			{
				$vectorSearch: {
					queryVector: embedding,
					path: indexInformation.path,
					numCandidates: 100,
					limit: this.kNumber,
					index: indexInformation.embeddedIndex,
				},
			},
			// every pre-filter data needs to be defined on atlas search index definition
			{
				$match: {
					customerId,
				},
			},
		];

		if (projection) {
			aggregatePipeline.push({
				$project: projection,
			});
		}

		const documents = await this.collectionInstance
			.aggregate(aggregatePipeline)
			.toArray();

		return documents;
	}

	async addReference(input: IAddDocumentInput): Promise<void> {
		const { document, metadata, source, customerId, summary } = input;

		const embedding = await this.getEmbedding({
			query: document,
			additionalInfo: {
				userIdentifier: customerId,
			},
		});

		const result = await this.collectionInstance.insertOne({
			customerId,
			source,
			metadata,
			summary,
			note: document,
			noteEmbedding: embedding,
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
