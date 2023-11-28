import { CHAT_ROLE } from "../constants";

interface IChatQuery {
  role: CHAT_ROLE,
  content: string
}

export {
  IChatQuery
}