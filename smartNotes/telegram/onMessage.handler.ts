import config from "../../config";
import telegramClient from "./smartNotesTelegram.client";
import { NOTES_INLINE_BUTTON_ACTION } from '../constants';

// export const processMessage = async (query: string, messageInfo: TelegramBot.Message) => {
//   // const username = messageInfo.chat.username;

//   const context = await new JagoContextService().query(query);

//   const userQuery = new UserQuery(query).withContext(context);

//   const systemQuery = new SystemQuery('You are "Tanya Jago Support", a helpful and knowledgeable assistant for Bank Jago Customer. Your goal is to provide accurate and relevant information, use the provided documents delimited by triple quotes to answer a sentence from customer. If the answer cannot be found in the documents, answer with "I sincerely apologize for any inconvenience caused by my inability to answer your question at this time. I am constantly learning and improving, and I will strive to provide more comprehensive support in the future." without saying you could not found any reference from document');

//   const llmProcessor = new HuggingFaceClient(config.llmBaseUrl);

//   const generatedText = await llmProcessor.setSystemQuery(systemQuery).setUserQuery(userQuery).exec();

//   await telegramClient.sendMessage(messageInfo.chat.id, generatedText);
// }

const buttons = [
  [
    { text: "📝 Add notes", callback_data: NOTES_INLINE_BUTTON_ACTION.ADD_NOTES },
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

  // await processMessage(message, messageInfo);
});

