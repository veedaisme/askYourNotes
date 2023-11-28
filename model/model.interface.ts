import { CHAT_ROLE } from "../constants";
import SystemQuery from "./SystemQuery";
import UserQuery from "./UserQuery";

interface IChatQuery {
  role: CHAT_ROLE,
  content: string
}

abstract class IQuery {
  query: string;

  constructor(query: string) {
    this.query = query;
  }

  abstract toPrompt(): IChatQuery
}

/**
 * Builder class of llm processor
 */
abstract class BaseLLMProcessor {
  systemQuery!: SystemQuery;
  userQuery!: UserQuery;

  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  abstract setSystemQuery(query: SystemQuery): BaseLLMProcessor;

  abstract setUserQuery(query: UserQuery): BaseLLMProcessor;

  abstract exec(queryText: UserQuery): Promise<string>;
}
export {
  IQuery,
  IChatQuery,
  BaseLLMProcessor,
}