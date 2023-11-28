import SystemQuery from "./SystemQuery";
import UserQuery from "./UserQuery";

/**
 * Builder class of llm processor
 */
abstract class IBaseLLMProcessor {
  systemQuery: SystemQuery = new SystemQuery(SystemQuery.defaultSystemQuery);

  userQuery!: UserQuery;

  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  abstract setSystemQuery(query: SystemQuery): IBaseLLMProcessor;

  abstract setUserQuery(query: UserQuery): IBaseLLMProcessor;

  abstract exec(queryText: UserQuery): Promise<string>;
}

export default IBaseLLMProcessor;