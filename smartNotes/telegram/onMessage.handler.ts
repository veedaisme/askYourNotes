import config from "../../config";
import telegramClient from "./smartNotesTelegram.client";
import { NOTES_INLINE_BUTTON_ACTION } from '../constants';
import { ACTION_MESSAGE, MESSAGE } from "./message.enum";
import { BOT_COMMANDS } from "./command.enum";
import interactionHandler from "./interactionHandler";

const buttons = [
  [
    { text: ACTION_MESSAGE.ADD_NOTES, callback_data: NOTES_INLINE_BUTTON_ACTION.WRITE_NOTE },
    { text: ACTION_MESSAGE.ASK_NOTES, callback_data: NOTES_INLINE_BUTTON_ACTION.ASK_NOTES },
  ]
];

const inlineKeyboardMarkup = {
  inline_keyboard: buttons
};

telegramClient.on('message', async function (messageInfo) {
  const message = messageInfo.text as string;
  const chatId = messageInfo.chat.id;

  if (config.isOffline) {
    await telegramClient.sendMessage(chatId, MESSAGE.BOT_OFFLINE);
    return;
  }

  if (message === BOT_COMMANDS.START) {
    await telegramClient.sendMessage(chatId, MESSAGE.WELCOME, { reply_markup: inlineKeyboardMarkup });
    return;
  }

  if (message === BOT_COMMANDS.WRITE_NOTE) {
    await interactionHandler.writeNote(chatId);
    return;
  }
  
  if (message === BOT_COMMANDS.ASK_NOTE) {
    await interactionHandler.askNotes(chatId);
    return;
  }
});

