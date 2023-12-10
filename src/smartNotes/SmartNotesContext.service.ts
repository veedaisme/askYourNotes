import { VECTOR_COLLECTION_NAME } from "../constants";
import MongodbContext, { IQueryInput } from "../context/MongoDb.context";

class SmartNotesContext extends MongodbContext {
  constructor() {
    super(VECTOR_COLLECTION_NAME.NOTES, 'note_db');
  }

  async ask(input: Omit<IQueryInput, 'indexInformation'>): Promise<string> {
    const queryInput: IQueryInput = {
      ...input,
      indexInformation: {
        path: 'noteEmbedding',
        embeddedIndex: 'notesIndex'
      }
    };

    const documents = await this.query(queryInput, {
      _id: 0,
      note: 1,
      createdAt: 1,
      summary: 1
    });

    const selectedReferences = documents.map(document => `context: ${document.note}
    summary: ${document.summary ? document.summary : ''}`);

    const flattenReference = selectedReferences.join('\n');

    return flattenReference;
  }
}

export default SmartNotesContext;