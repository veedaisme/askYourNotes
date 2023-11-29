import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import { IVectorDbConfig } from "../model/model.interface";
import { VECTOR_COLLECTION_NAME } from "../constants";

class VectorDbClient extends ChromaClient {
  embeddingFunction: OpenAIEmbeddingFunction;

  constructor(config: IVectorDbConfig) {
    super();

    this.embeddingFunction = new OpenAIEmbeddingFunction({
      openai_api_key: config.embedderApiKey,
    });

    this.collection.bind(this);
    this.addCollection.bind(this);
    this.deleteCollection.bind(this);
  }

  collection(vectorCollectionName: VECTOR_COLLECTION_NAME) {
    return this.getCollection({
      name: vectorCollectionName,
      embeddingFunction: this.embeddingFunction,
    });
  }
  
  addCollection(vectorCollectionName: VECTOR_COLLECTION_NAME) {
    return this.createCollection({
      name: vectorCollectionName,
      embeddingFunction: this.embeddingFunction,
    });
  }
  
  dropCollection(vectorCollectionName: VECTOR_COLLECTION_NAME) {
    return this.deleteCollection({
      name: vectorCollectionName
    });
  }
}

export default VectorDbClient;