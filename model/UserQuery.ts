import { CHAT_ROLE } from "../constants";
import IQuery from "./IQuery";
import { IChatQuery } from "./model.interface";

class UserQuery extends IQuery {

  constructor(query: string) {
    super(query);

    return this;
  }

  toPrompt(): IChatQuery {
    return {
      role: CHAT_ROLE.USER,
      content: this.query
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
}

export default UserQuery;