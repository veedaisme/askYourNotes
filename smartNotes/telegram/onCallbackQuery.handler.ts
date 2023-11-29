import TelegramBot, { ChatId } from "node-telegram-bot-api";

import telegramClient from "./smartNotesTelegram.client";
import { TELEGRAM_INLINE_BUTTON_ACTION } from "../../constants";
// import { processMessage } from "./onMessage.handler";

telegramClient.on('callback_query', async (callbackQuery) => {
  const callbackData = callbackQuery.data;

  if (callbackData === TELEGRAM_INLINE_BUTTON_ACTION.USER_START) {
    // TODO(fakhri): update handler on message
    // await processMessage('Hi, Tanya Jago?', callbackQuery.message as TelegramBot.Message);
    await telegramClient.deleteMessage(callbackQuery.message?.chat.id as ChatId, callbackQuery.message?.message_id as number);
    return;
  }

  if (callbackData === TELEGRAM_INLINE_BUTTON_ACTION.ADMIN_START) {
    await telegramClient.sendMessage(callbackQuery.message?.chat.id as ChatId, 'hi veeda, coming soon ...');
    await telegramClient.deleteMessage(callbackQuery.message?.chat.id as ChatId, callbackQuery.message?.message_id as number);
    return;
  }

  telegramClient.answerCallbackQuery(callbackQuery.id);
});