import SystemQuery from './SystemQuery';
import UserQuery from './UserQuery';

/**
 * Builder class of llm processor
 */
abstract class IBaseLLMProcessor {
	protected systemQuery: SystemQuery = new SystemQuery(
		SystemQuery.defaultSystemQuery,
	);

	protected userQuery!: UserQuery;

	protected baseUrl!: string;

	setSystemQuery(query: SystemQuery) {
		this.systemQuery = query;

		return this;
	}

	setUserQuery(query: UserQuery) {
		this.userQuery = query;

		return this;
	}

	abstract exec(): Promise<string>;
}

export default IBaseLLMProcessor;
