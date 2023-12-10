import { CHAT_ROLE } from '../constants';
import IQuery from './IQuery';
import { IChatQuery } from './model.interface';

class UserQuery extends IQuery {
	toChatPrompt(): IChatQuery {
		return {
			role: CHAT_ROLE.USER,
			content: this.query,
		};
	}

	withContext(context: string) {
		const queryWithContext = `
      """ ${context} """

      sentence: ${this.query}
    `;

		this.query = queryWithContext;

		return this;
	}

	wrapWith(character: string) {
		const wrappedQuery = `${character} ${this.query} ${character}`;

		this.query = wrappedQuery;

		return this;
	}
}

export default UserQuery;
