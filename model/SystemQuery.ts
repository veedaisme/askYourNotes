import { CHAT_ROLE } from "../constants";
import { IChatQuery, IQuery } from "./model.interface";

class SystemQuery extends IQuery {
  static defaultSystemQuery = 'You are a helpful assistant.';

  constructor(query: string = SystemQuery.defaultSystemQuery) {
    super(query);
  }

  toPrompt(): IChatQuery {
    return {
      role: CHAT_ROLE.SYSTEM,
      content: this.query
    };
  }
}

export default SystemQuery;