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

const _seamlessAddNote = async (message: TelegramBot.Message) => {
  const { text } = message;

  const savedMessageMarkdown = `\`\`\` ${text} \`\`\``;

    await telegramClient.sendMessage(message?.chat.id as ChatId, savedMessageMarkdown, {
      parse_mode: 'MarkdownV2'
    });
    await telegramClient.sendMessage(message?.chat.id as ChatId, MESSAGE.NOTE_SAVED);
}

const seamless = async (message: TelegramBot.Message) => {
  const { text } = message;
  const username = message.chat.username as string;

  await telegramClient.sendChatAction(message?.chat.id as ChatId, 'typing');

  if (!text) {
    return;
  }

  const isSaveNotes = await smartNoteService.seamless(text, {
    identifier: username,
    source: 'telegram'
  })

  if (isSaveNotes) {
    await _seamlessAddNote(message);

    return;
  }

  const summary = await smartNoteService.seamlessQuestion(text, {
    identifier: username,
    source: 'telegram'
  });
  
  await telegramClient.sendMessage(message?.chat.id as ChatId, summary);
}


const interactionHandler = {
  writeNote,
  askNotes,
  seamless
}

export default interactionHandler;