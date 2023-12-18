import TelegramBot, { ChatId } from 'node-telegram-bot-api';
import UserPreferenceService from '../../userPreference/UserPreference.service';
import {
	IChatMode,
	IUserPreferences,
} from '../../userPreference/userPreference.interface';
import SmartNotesService from '../SmartNotes.service';
import { NOTES_INLINE_BUTTON_ACTION } from '../constants';
import { ACTION_MESSAGE, MESSAGE } from './message.enum';
import telegramClient from './smartNotesTelegram.client';

const smartNoteService = new SmartNotesService();
const userPreferenceService = new UserPreferenceService();

const _handleReplyCreateNote = async (message: TelegramBot.Message) => {
	const note = message.text;
	const username = message.chat.username as string;

	if (!note) {
		return;
	}

	await smartNoteService.addNote(note, username, 'telegram', {
		identifier: username,
		source: 'telegram',
	});

	const savedMessageMarkdown = `\`\`\` ${note} \`\`\``;

	await telegramClient.sendMessage(
		message?.chat.id as ChatId,
		savedMessageMarkdown,
		{
			parse_mode: 'MarkdownV2',
		},
	);
	await telegramClient.sendMessage(
		message?.chat.id as ChatId,
		MESSAGE.NOTE_SAVED,
	);
};

const handleReplyAskNote = async (message: TelegramBot.Message) => {
	const question = message.text;
	const username = message.chat.username as string;

	if (!question) {
		return;
	}

	await telegramClient.sendChatAction(message?.chat.id as ChatId, 'typing');

	const relevantInformation = await smartNoteService.askNote(
		question,
		username,
	);

	await telegramClient.sendMessage(
		message?.chat.id as ChatId,
		relevantInformation,
	);
};

const writeNote = async (chatId: ChatId) => {
	const inputNoteMesage = await telegramClient.sendMessage(
		chatId as ChatId,
		MESSAGE.ADD_NOTE_INPUT_MESSAGE,
		{
			reply_markup: {
				force_reply: true,
				input_field_placeholder: 'add your notes here',
			},
		},
	);

	telegramClient.onReplyToMessage(
		inputNoteMesage.chat.id,
		inputNoteMesage.message_id,
		_handleReplyCreateNote,
	);
};

const askNotes = async (chatId: ChatId) => {
	const inputNoteMesage = await telegramClient.sendMessage(
		chatId as ChatId,
		MESSAGE.ASK_NOTE_INPUT_MESSAGE,
		{
			reply_markup: {
				force_reply: true,
				input_field_placeholder: 'ask me anything about your notes',
			},
		},
	);

	telegramClient.onReplyToMessage(
		inputNoteMesage.chat.id,
		inputNoteMesage.message_id,
		handleReplyAskNote,
	);
};

const _seamlessAddNote = async (
	message: TelegramBot.Message,
	answer: string,
) => {
	const savedMessageMarkdown = `\`\`\` ${answer} \`\`\``;

	await telegramClient.sendMessage(
		message?.chat.id as ChatId,
		savedMessageMarkdown,
		{
			parse_mode: 'MarkdownV2',
		},
	);
	await telegramClient.sendMessage(
		message?.chat.id as ChatId,
		MESSAGE.NOTE_SAVED,
	);
};

const seamless = async (message: TelegramBot.Message) => {
	const { text } = message;
	const username = message.chat.username as string;

	await telegramClient.sendChatAction(message?.chat.id as ChatId, 'typing');

	if (!text) {
		return;
	}

	const seamlessResponse = await smartNoteService.seamless(
		text,
		username,
		'telegram',
	);

	if (seamlessResponse.isSaveNote) {
		await _seamlessAddNote(message, seamlessResponse.answer);

		return;
	}

	await telegramClient.sendMessage(
		message?.chat.id as ChatId,
		seamlessResponse.answer,
	);
};

const getStartInlineKeyboard = (inlineInput: {
	currentChatMode: IChatMode;
}) => {
	const buttons = [
		// TODO(fakhri): temporary disable to check the interaction
		// [
		// 	{
		// 		text: ACTION_MESSAGE.ADD_NOTES,
		// 		callback_data: NOTES_INLINE_BUTTON_ACTION.WRITE_NOTE,
		// 	},
		// 	{
		// 		text: ACTION_MESSAGE.ASK_NOTES,
		// 		callback_data: NOTES_INLINE_BUTTON_ACTION.ASK_NOTES,
		// 	},
		// ],
		[
			{
				text: `${inlineInput.currentChatMode === 'input' ? '🧠' : '📝'} ${
					ACTION_MESSAGE.SWITCH_MODE
				} ${
					inlineInput.currentChatMode === 'input'
						? 'chat with AI'
						: 'input notes'
				}`,
				callback_data: NOTES_INLINE_BUTTON_ACTION.SWITCH_MODE,
			},
		],
	];

	return {
		inline_keyboard: buttons,
	};
};

const start = async (message: TelegramBot.Message) => {
	const username = message.chat.username as string;
	const chatId = message.chat.id as ChatId;

	const chatMode = await userPreferenceService.getChatMode(username);

	await telegramClient.sendMessage(chatId, MESSAGE.WELCOME, {
		reply_markup: getStartInlineKeyboard({ currentChatMode: chatMode }),
	});
};

const switchChatMode = async (message: TelegramBot.Message): Promise<void> => {
	const username = message.chat.username as string;

	const newChatMode = await userPreferenceService.switchChatMode(username);

	await telegramClient.deleteMessage(
		message?.chat.id as ChatId as ChatId,
		message.message_id as number,
	);

	await telegramClient.sendMessage(
		message?.chat.id as ChatId as ChatId,
		`${MESSAGE.WELCOME}
    
    ${MESSAGE.SUCCESS_SWITCH_CHAT_MODE} to ${newChatMode}`,
		{
			reply_markup: getStartInlineKeyboard({ currentChatMode: newChatMode }),
		},
	);
};

const interactionHandler = {
	start,
	writeNote,
	askNotes,
	seamless,
	switchChatMode,
};

export default interactionHandler;
