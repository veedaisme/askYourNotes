import { ChatId } from "node-telegram-bot-api";

import telegramClient from "./smartNotesTelegram.client";
import { NOTES_INLINE_BUTTON_ACTION } from "../constants";
import interactionHandler from "./interactionHandler";

telegramClient.on('callback_query', async (callbackQuery) => {
  const callbackData = callbackQuery.data;

  if (callbackData === NOTES_INLINE_BUTTON_ACTION.ADD_NOTES) {
    await interactionHandler.createNote(callbackQuery.message?.chat.id as ChatId);

    await telegramClient.answerCallbackQuery(callbackQuery.id);
    
    return;
  }

  if (callbackData === NOTES_INLINE_BUTTON_ACTION.ASK_NOTES) {
    await interactionHandler.askNotes(callbackQuery.message?.chat.id as ChatId);

    await telegramClient.answerCallbackQuery(callbackQuery.id);
  
    return;
  }
});