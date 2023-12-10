import { IChatQuery } from './model.interface';

abstract class IQuery {
	query: string;

	constructor(query: string) {
		this.query = query;
	}

	abstract toChatPrompt(): IChatQuery;

	getQuery() {
		return this.query;
	}
}

export default IQuery;
