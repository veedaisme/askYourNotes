import { ChatId } from 'node-telegram-bot-api';

import { NOTES_INLINE_BUTTON_ACTION } from '../constants';
import interactionHandler from './interactionHandler';
import telegramClient from './smartNotesTelegram.client';

telegramClient.on('callback_query', async (callbackQuery) => {
	const callbackData = callbackQuery.data;

	if (callbackData === NOTES_INLINE_BUTTON_ACTION.WRITE_NOTE) {
		await interactionHandler.writeNote(
			callbackQuery.message?.chat.id as ChatId,
		);

		await telegramClient.answerCallbackQuery(callbackQuery.id);

		return;
	}

	if (callbackData === NOTES_INLINE_BUTTON_ACTION.ASK_NOTES) {
		await interactionHandler.askNotes(callbackQuery.message?.chat.id as ChatId);

		await telegramClient.answerCallbackQuery(callbackQuery.id);

		return;
	}
});
