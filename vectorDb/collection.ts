import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import { VECTOR_COLLECTION_NAME } from "../constants";
import config from '../config';

const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: config.openAIKey,
});

const dbClient = new ChromaClient();

const getCollection = (vectorCollectionName: VECTOR_COLLECTION_NAME) => {
  return dbClient.getCollection({
    name: vectorCollectionName,
    embeddingFunction: embedder,
  });
}

const createCollection = (vectorCollectionName: VECTOR_COLLECTION_NAME) => {
  return dbClient.createCollection({
    name: vectorCollectionName,
    embeddingFunction: embedder,
  });
}

const deleteCollection = (vectorCollectionName: VECTOR_COLLECTION_NAME) => {
  return dbClient.deleteCollection({
    name: vectorCollectionName
  });
}

const vectorDb = {
  getCollection,
  createCollection,
  deleteCollection
}

export default vectorDb;