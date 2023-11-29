import { IncludeEnum } from "chromadb";
import { v4 as uuidv4 } from 'uuid';

import { VECTOR_COLLECTION_NAME } from "../constants";
import vectorDbClient from "../vectorDb";
import { Metadata } from "../vectorDb/vectorDb.interface";

abstract class IContextService {
  collectionName: VECTOR_COLLECTION_NAME;
  db = vectorDbClient;

  constructor(collectionName: VECTOR_COLLECTION_NAME) {
    this.collectionName = collectionName;
    this.addReferences.bind(this);
    this.query.bind(this);
  }

  async query(query: string): Promise<string> {
    const collection = await this.db.collection(this.collectionName);

    const results = await collection.query({
      nResults: 5,
      queryTexts: [query],
      include: [IncludeEnum.Documents]
    });
    
    const context = results.documents[0].join(' ');
  
    return context;
  }
  
  async addReferences(documents: string[], metadata?: Metadata) {
    const collection = await this.db.collection(this.collectionName);    
  
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
}

export default IContextService;

