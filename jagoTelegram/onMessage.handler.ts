import config from "../config";
import telegramClient from "./jagoTelegram.client";
import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_INLINE_BUTTON_ACTION, CHAT_ROLE } from '../constants';
import UserQuery from "../model/UserQuery";
import HuggingFaceClient from "../llm/huggingFace/huggingFace.client";
import SystemQuery from "../model/SystemQuery";
import JagoContextService from "../Jago/JagoContext.service";

const processMessage = async (query: string, messageInfo: TelegramBot.Message) => {
  // const username = messageInfo.chat.username;

  const context = await new JagoContextService().query(query);

  const userQuery = new UserQuery(query).withContext(context);

  const systemQuery = new SystemQuery('Use the provided documents delimited by triple quotes to answer a sentence from user. If the answer cannot be found in the documents, answer with "I don\'t know." in a polite and formal way');

  const llmProcessor = new HuggingFaceClient(config.llmBaseUrl);

  const generatedText = await llmProcessor.setSystemQuery(systemQuery).setUserQuery(userQuery).exec();

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

