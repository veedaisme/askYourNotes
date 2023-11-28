import { CHAT_ROLE } from "../constants";
import IQuery from "./IQuery";
import { IChatQuery } from "./model.interface";

class UserQuery extends IQuery {

  constructor(query: string) {
    super(query);
  }

  toPrompt(): IChatQuery {
    return {
      role: CHAT_ROLE.USER,
      content: this.query
    };
  }
}

export default UserQuery;