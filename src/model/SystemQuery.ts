import { CHAT_ROLE } from "../constants";
import IQuery from "./IQuery";
import { IChatQuery } from "./model.interface";

class SystemQuery extends IQuery {
  static defaultSystemQuery = 'You are a helpful assistant.';

  constructor(query: string) {
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