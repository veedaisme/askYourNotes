import { Metadata } from '../vectorDb/vectorDb.interface';

abstract class IContextService {
	constructor() {
		this.addReferences.bind(this);
		this.query.bind(this);
	}

	abstract query(
		query: string,
		metadata: Metadata,
		keywords: string[],
	): Promise<string>;

	abstract addReferences(
		documents: string[],
		metadata?: Metadata,
	): Promise<void>;
}

export default IContextService;
