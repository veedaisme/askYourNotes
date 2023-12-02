import { IncludeEnum } from "chromadb";
import { v4 as uuidv4 } from 'uuid';

import { VECTOR_COLLECTION_NAME } from "../constants";
import vectorDbClient from "../vectorDb";
import { Metadata } from "../vectorDb/vectorDb.interface";

abstract class IContextService {
  private collectionName: VECTOR_COLLECTION_NAME;
  private db = vectorDbClient;

  constructor(collectionName: VECTOR_COLLECTION_NAME) {
    this.collectionName = collectionName;
    this.addReferences.bind(this);
    this.query.bind(this);

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

  async query(query: string, metadata: Metadata = {}): Promise<string> {
    const collection = await this.db.collection(this.collectionName);

    const results = await collection.query({
      nResults: 5,
      queryTexts: [query],
      include: [IncludeEnum.Documents, IncludeEnum.Metadatas],
      where: metadata
    });
    
    const context = results.documents[0].join(' ');
  
    return context;
  }
  
  async addReferences(documents: string[], metadata?: Metadata) {
    const collection = await this.db.collection(this.collectionName);    
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collectionObject = documents.reduce((prev: any, document) => { 
      const { ids, metadatas, documents } = prev;
  
      const currentId = uuidv4();
      const currentMetadatas = metadata ?? { source: 'web', context: 'jago' };
  
      ids.push(currentId);
      metadatas.push(currentMetadatas);
      documents.push(document);
  
      return {
        ids,
        metadatas,
        documents
      };
    }, { ids: [], metadatas: [], documents: [] });
  
    await collection.add(collectionObject);
  }

  async dropCollection() {
    await this.db.dropCollection(this.collectionName);
  }

  abstract addReference(document: string, metadata: unknown): Promise<void>;
}

export default IContextService;

