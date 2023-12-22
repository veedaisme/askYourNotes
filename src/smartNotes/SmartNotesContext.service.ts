import { DB_COLLECTION_NAME } from '../constants';
import MongodbContext, { IQueryInput } from '../context/MongoDb.context';

class SmartNotesContext extends MongodbContext {
	constructor() {
		super(DB_COLLECTION_NAME.NOTES, 'note_db');
	}

	async ask(input: Omit<IQueryInput, 'indexInformation'>): Promise<string> {
		const queryInput: IQueryInput = {
			...input,
			indexInformation: {
				path: 'noteEmbedding',
				embeddedIndex: 'notesIndex',
			},
		};

		const documents = await this.query(queryInput);

		const selectedReferences = documents.map((document) => `${document.note}`);

		const flattenReference = selectedReferences.join('\n\n');

		return flattenReference;
	}
}

export default SmartNotesContext;
