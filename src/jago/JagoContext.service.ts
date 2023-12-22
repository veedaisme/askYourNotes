import { DB_COLLECTION_NAME } from '../constants';
import ChromaContext from '../context/Chromadb.context';

class JagoContextService extends ChromaContext {
	constructor() {
		super(DB_COLLECTION_NAME.JAGO);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	addReference(_document: string, _metadata: unknown): Promise<void> {
		throw new Error('Method not implemented.');
	}
}

export default JagoContextService;
