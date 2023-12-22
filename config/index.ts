const configParameter = {
	isAdminOnly: process.env.isAdminMode === 'true' || false,
	knowledgeFileName: 'baseKnowledge/raw.json',
	flattenKnowledgeFileName: 'baseKnowledge/flatten.json',
	llmBaseUrl: 'http://192.168.68.120:1234',
	ollamaBaseUrl: 'http://localhost:11434',
	timeout: 600000,
	isOffline: false,
	chromaDbBaseUrl: process.env.CHROMA_BASE_URL,
	mongoDbUser: process.env.MONGO_USER as string,
	isChatV2: true,
};

const creds = {
	telegramToken: process.env.TELEGRAM_TOKEN as string,
	openAIKey: process.env.OPENAI_KEY as string,
	mongodbPassword: process.env.MONGO_PASSWORD as string,
	askYourNotesAssistantId: process.env.ASK_YOUR_NOTES_ASSISTANT_ID as string,
};

const config = {
	...configParameter,
	...creds,
};

export default config;
