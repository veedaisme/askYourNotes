const { v4: uuidv4 } = require('uuid')
const raw = require('./baseKnowledge/raw.json');
const { VECTOR_COLLECTION_NAME } = require("./constants");
const { getCollection, createCollection, deleteCollection } = require('./db');

const jagoInit = async () => {
  const collection = await createCollection(VECTOR_COLLECTION_NAME.JAGO);

  const collectionObject = raw.reduce((prev, current) => { 
    const ids = prev.ids ?? [];
    const metadatas = prev.metadatas ?? [];
    const documents = prev.documents ?? [];

    const currentId = uuidv4();
    const metadata = 'web';
    const document = current.content;

    ids.push(currentId);
    metadatas.push({ source: metadata });
    documents.push(document);

    return {
      ids,
      metadatas,
      documents
    };
  }, {});

  await collection.add(collectionObject);
}

const queryTest = async (query) => {
  const collection = await getCollection(VECTOR_COLLECTION_NAME.JAGO);

  const results = await collection.query({
    nResults: 4,
    queryTexts: [query],
    include: [ "documents" ]
  });

  console.log(results);
}

const peek = async () => {
  const collection = await getCollection(VECTOR_COLLECTION_NAME.JAGO);

  console.log(await collection.get())
}

queryTest(process.argv[2]).then(console.log);