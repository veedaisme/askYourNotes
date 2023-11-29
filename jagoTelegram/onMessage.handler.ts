import config from "../config";
import telegramClient from "./jagoTelegram.client";
import { IncludeEnum } from "chromadb";
import TelegramBot from "node-telegram-bot-api";
import { VECTOR_COLLECTION_NAME, TELEGRAM_INLINE_BUTTON_ACTION, CHAT_ROLE } from '../constants';
import UserQuery from "../model/UserQuery";
import HuggingFaceClient from "../llm/huggingFace/huggingFace.client";
import vectorDbClient from "../vectorDb";

// TODO(fakhri): move vektor db to class if needed
const getContext = async (query: string) => {
  const collection = await vectorDbClient.collection(VECTOR_COLLECTION_NAME.JAGO);

  const results = await collection.query({
    nResults: 5,
    queryTexts: [query],
    include: [IncludeEnum.Documents]
  });

  const context = results.documents[0].join(' ');

  return {
    role: 'system',
    content: context
  }
}

const getPreContext = async (query: string) => {
  const queryBasedContext = await getContext(query);

  const systemPrompt = [
    {
      role: CHAT_ROLE.SYSTEM,
      content: queryBasedContext.content
    },
  ];

  return systemPrompt;
}

const processMessage = async (query: string, messageInfo: TelegramBot.Message) => {
  const username = messageInfo.chat.username;

  const userQuery = new UserQuery(query);

  // let context = await getPreContext(query);

  // const prompt = [...context, currentQuery]

  const llmProcessor = new HuggingFaceClient(config.llmBaseUrl);

  const generatedText = await llmProcessor.setUserQuery(userQuery).exec();

  await telegramClient.sendMessage(messageInfo.chat.id, generatedText);
}

const buttons = [
  [
    { text: "I'm Jago User", callback_data: TELEGRAM_INLINE_BUTTON_ACTION.USER_START },
    { text: "I'm Admin", callback_data: TELEGRAM_INLINE_BUTTON_ACTION.ADMIN_START }
  ]
];

const inlineKeyboardMarkup = {
  inline_keyboard: buttons
};

telegramClient.on('message', async function (messageInfo) {
  const message = messageInfo.text as string;

  if (config.isOffline) {
    await telegramClient.sendMessage(messageInfo.chat.id, 'bot is offline. comeback later ehehe ...');
    return;
  }

  if (message === '/start') {
    await telegramClient.sendMessage(messageInfo.chat.id, 'Hi ...', { reply_markup: inlineKeyboardMarkup });
    return;
  }

  await processMessage(message, messageInfo);
});

