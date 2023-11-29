export enum CHAT_ROLE {
  USER = 'user',
  SYSTEM = 'system',
  ASSISTANT = 'assistant'
}

export enum VECTOR_COLLECTION_NAME {
  JAGO = 'jago'
}

export enum TELEGRAM_INLINE_BUTTON_ACTION {
  USER_START = "jago_user_start_button",
  ADMIN_START = "jago_admin_start_button",
}

const constants = {
  VECTOR_COLLECTION_NAME,
  TELEGRAM_INLINE_BUTTON_ACTION
}

export default constants;