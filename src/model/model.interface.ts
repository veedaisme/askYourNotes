import { CHAT_ROLE } from "../constants";

interface IVectorDbConfig {
  embedderApiKey: string,
  baseUrl?: string
}

interface IChatQuery {
  role: CHAT_ROLE,
  content: string
}

export {
  IChatQuery,
  IVectorDbConfig
}