import TelegramBot, { ChatId } from "node-telegram-bot-api";

import telegramClient from "./smartNotesTelegram.client";
import { NOTES_INLINE_BUTTON_ACTION } from "../constants";
import SmartNotesService from "../SmartNotes.service";

const smartNoteService = new SmartNotesService();

const handleReply = async (message: TelegramBot.Message) => {
  const note = message.text;
  const username = message.chat.username as string;

  if (!note){
    return;
  }
  
  await smartNoteService.addNote(note, {
    identifier: username,
    source: 'telegram'
  });

  const savedMessageMarkdown = `\`\`\` ${note} \`\`\``;

  await telegramClient.sendMessage(message?.chat.id as ChatId, savedMessageMarkdown, {
    parse_mode: 'MarkdownV2'
  });
  await telegramClient.sendMessage(message?.chat.id as ChatId, 'Saved 😊');
}

telegramClient.on('callback_query', async (callbackQuery) => {
  const callbackData = callbackQuery.data;

  if (callbackData === NOTES_INLINE_BUTTON_ACTION.ADD_NOTES) {
    const messageId = callbackQuery.message?.message_id as number;

    const inputNoteMesage = await telegramClient.sendMessage(callbackQuery.message?.chat.id as ChatId, 'what do you have in mind ?', {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "add your notes here",
      },
    });

    telegramClient.onReplyToMessage(inputNoteMesage.chat.id, inputNoteMesage.message_id, handleReply);

    await telegramClient.answerCallbackQuery(callbackQuery.id);
    
    return;
  }

  // if (callbackData === NOTES_INLINE_BUTTON_ACTION.ADMIN_START) {
  //   await telegramClient.sendMessage(callbackQuery.message?.chat.id as ChatId, 'hi veeda, coming soon ...');
  //   await telegramClient.deleteMessage(callbackQuery.message?.chat.id as ChatId, callbackQuery.message?.message_id as number);
  //   return;
  // }

  telegramClient.answerCallbackQuery(callbackQuery.id);
});