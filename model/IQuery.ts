import { IChatQuery } from "./model.interface";

abstract class IQuery {
  query: string;

  constructor(query: string) {
    this.query = query;
  }

  abstract toPrompt(): IChatQuery
}

export default IQuery;