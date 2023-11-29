import TelegramBot, { ChatId } from "node-telegram-bot-api";

import telegramClient from "./smartNotesTelegram.client";
import { NOTES_INLINE_BUTTON_ACTION } from "../constants";
import SmartNotesService from "../SmartNotes.service";

const smartNoteService = new SmartNotesService();

const handleReplyCreateNote = async (message: TelegramBot.Message) => {
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

const handleReplyAskNote = async (message: TelegramBot.Message) => {
  const question = message.text;
  const username = message.chat.username as string;

  if (!question){
    return;
  }

  await telegramClient.sendChatAction(message?.chat.id as ChatId, 'typing');
  
  const relevantInformation = await smartNoteService.askNote(question, {
    identifier: username,
    source: 'telegram'
  });

  await telegramClient.sendMessage(message?.chat.id as ChatId, relevantInformation);
}

telegramClient.on('callback_query', async (callbackQuery) => {
  const callbackData = callbackQuery.data;

  if (callbackData === NOTES_INLINE_BUTTON_ACTION.ADD_NOTES) {
    const inputNoteMesage = await telegramClient.sendMessage(callbackQuery.message?.chat.id as ChatId, 'what do you have in mind ?', {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "add your notes here",
      },
    });

    telegramClient.onReplyToMessage(inputNoteMesage.chat.id, inputNoteMesage.message_id, handleReplyCreateNote);

    await telegramClient.answerCallbackQuery(callbackQuery.id);
    
    return;
  }

  if (callbackData === NOTES_INLINE_BUTTON_ACTION.ASK_NOTES) {
    const inputNoteMesage = await telegramClient.sendMessage(callbackQuery.message?.chat.id as ChatId, 'what do you want to ask ?', {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "ask me anything about your notes",
      },
    });

    telegramClient.onReplyToMessage(inputNoteMesage.chat.id, inputNoteMesage.message_id, handleReplyAskNote);

    await telegramClient.answerCallbackQuery(callbackQuery.id);
  
    return;
  }
});