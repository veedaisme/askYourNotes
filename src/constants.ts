export enum CHAT_ROLE {
	USER = 'user',
	SYSTEM = 'system',
	ASSISTANT = 'assistant',
}

export enum DB_COLLECTION_NAME {
	JAGO = 'jago',
	SMART_NOTES = 'smart_notes',
	// only on mongodb
	NOTES = 'notes',
	USER_THREADS = 'user_threads',
	USER_PREFERENCES = 'user_preferences',
}

export type IContextSource = 'telegram' | 'slack' | 'whatsapp';
