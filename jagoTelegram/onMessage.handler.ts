import config from "../config";
import { TELEGRAM_INLINE_BUTTON_ACTION } from "../constants";
import telegramClient from "./client";

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
  const message = messageInfo.text
  if (config.isOffline) {
    await telegramClient.sendMessage(messageInfo.chat.id, 'bot is offline. comeback later ehehe ...');
    return;
  }

  if (message === '/start') {
    await telegramClient.sendMessage(messageInfo.chat.id, 'Hi ...', { reply_markup: inlineKeyboardMarkup });
    return;
  }

  // TODO(fakhri): update handler on message
  // await processMessage(messageInfo);
});