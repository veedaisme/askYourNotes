const configParameter = {
  isAdminOnly: process.env.isAdminMode === 'true' || false,
  knowledgeFileName: 'baseKnowledge/raw.json',
  flattenKnowledgeFileName: 'baseKnowledge/flatten.json',
  llmBaseUrl: "http://192.168.68.120:1234",
  timeout: 600000,
  isOffline: false,
  chromaDbBaseUrl: process.env.CHROMA_BASE_URL,
}

const creds = {
  telegramToken: process.env.TELEGRAM_TOKEN as string,
  openAIKey: process.env.OPENAI_KEY as string
};

const config = {
  ...configParameter,
  ...creds
}

export default config;