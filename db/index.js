const { ChromaClient, OpenAIEmbeddingFunction } = require("chromadb");
const creds = require('../creds');

const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: creds.openAIKey,
});

const dbClient = new ChromaClient();

const getCollection = (vectorCollectionName) => {
  return dbClient.getCollection({
    name: vectorCollectionName,
    embeddingFunction: embedder,
  });
}

const createCollection = (vectorCollectionName) => {
  return dbClient.createCollection({
    name: vectorCollectionName,
    embeddingFunction: embedder,
  });
}

const deleteCollection = (vectorCollectionName) => {
  return dbClient.deleteCollection({
    name: vectorCollectionName
  });
}

module.exports = {
  getCollection,
  createCollection,
  deleteCollection
}