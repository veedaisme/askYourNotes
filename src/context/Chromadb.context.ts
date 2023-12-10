import { IncludeEnum } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';
import { VECTOR_COLLECTION_NAME } from '../constants';
import IContextService from '../model/IContextService';
import vectorDbClient from '../vectorDb';
import { Metadata } from '../vectorDb/vectorDb.interface';

class ChromaContext extends IContextService {
	private collectionName: VECTOR_COLLECTION_NAME;
	private db = vectorDbClient;

	constructor(collectionName: VECTOR_COLLECTION_NAME) {
		super();

		this.collectionName = collectionName;

		this.initDb();
	}

	private async initDb() {
		try {
			await this.db.collection(this.collectionName);
		} catch (error) {
			console.warn(`Creating collection ${this.collectionName} ... `);

			this.db.addCollection(this.collectionName);
		}
	}

	async query(
		query: string,
		metadata: Metadata = {},
		keywords: string[] = [],
	): Promise<string> {
		const collection = await this.db.collection(this.collectionName);

		const queryText = [query, ...keywords];

		const results = await collection.query({
			nResults: 2,
			queryTexts: queryText,
			include: [IncludeEnum.Documents, IncludeEnum.Metadatas],
			where: metadata,
		});

		/**
		 * merge result from vector db for multiple query result into 1 result
		 */
		const mergedDocuments = results.documents.reduce((temporaryMergedDocument, documentPerQuery, ) => {
      if (!documentPerQuery) {
        return temporaryMergedDocument;
      }

      const mergedForInnerDocument = temporaryMergedDocument.concat(documentPerQuery);

      return mergedForInnerDocument;
    }, [])

		const context = mergedDocuments.join('');

		return context;
	}

	async addReferences(documents: string[], metadata?: Metadata) {
		const collection = await this.db.collection(this.collectionName);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const collectionObject = documents.reduce(
			(prev: any, document) => {
				const { ids, metadatas, documents } = prev;

				const currentId = uuidv4();
				const currentMetadatas = metadata ?? { source: 'web', context: 'jago' };

				ids.push(currentId);
				metadatas.push(currentMetadatas);
				documents.push(document);

				return {
					ids,
					metadatas,
					documents,
				};
			},
			{ ids: [], metadatas: [], documents: [] },
		);

		await collection.add(collectionObject);
	}

	async getAll() {
		const collection = await this.db.collection(this.collectionName);

		return await collection.get();
	}
}

export default ChromaContext;
