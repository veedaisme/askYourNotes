type Embedding = Array<number>;
type Embeddings = Array<Embedding>;
type Metadata = Record<string, string | number | boolean>;
type Metadatas = Array<Metadata>;
type Documents = Array<string>;
type ID = string;
type IDs = Array<ID>;

export interface IAddDocumentInput {
	ids: ID | IDs;
	embeddings?: Embedding | Embeddings;
	metadatas?: Metadata | Metadatas;
	documents?: string | Documents;
}

export { Embedding, Embeddings, Metadata, Metadatas, Documents, ID, IDs };
