export enum CHAT_ROLE {
  USER = 'user',
  SYSTEM = 'system',
  ASSISTANT = 'assistant'
}

export enum VECTOR_COLLECTION_NAME {
  JAGO = 'jago',
  SMART_NOTES = "smart_notes",
  // only on mongodb
  NOTES = "notes"
}

export type IContextSource = "telegram" | "slack" | "whatsapp";