import TelegramBot, { ChatId } from "node-telegram-bot-api";
import telegramClient from "./smartNotesTelegram.client";
import SmartNotesService from "../SmartNotes.service";
import { MESSAGE } from "./message.enum";

const smartNoteService = new SmartNotesService();

const _handleReplyCreateNote = async (message: TelegramBot.Message) => {
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
  await telegramClient.sendMessage(message?.chat.id as ChatId, MESSAGE.NOTE_SAVED);
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

const writeNote = async (chatId: ChatId) => {
  const inputNoteMesage = await telegramClient.sendMessage(chatId as ChatId, MESSAGE.ADD_NOTE_INPUT_MESSAGE, {
    reply_markup: {
      force_reply: true,
      input_field_placeholder: "add your notes here",
    },
  });

  telegramClient.onReplyToMessage(inputNoteMesage.chat.id, inputNoteMesage.message_id, _handleReplyCreateNote);
}

const askNotes = async (chatId: ChatId) => {
  const inputNoteMesage = await telegramClient.sendMessage(chatId as ChatId, MESSAGE.ASK_NOTE_INPUT_MESSAGE, {
    reply_markup: {
      force_reply: true,
      input_field_placeholder: "ask me anything about your notes",
    },
  });

  telegramClient.onReplyToMessage(inputNoteMesage.chat.id, inputNoteMesage.message_id, handleReplyAskNote);
}


const interactionHandler = {
  writeNote,
  askNotes
}

export default interactionHandler;