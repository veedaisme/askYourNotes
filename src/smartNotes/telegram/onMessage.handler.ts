import config from '../../../config';
import { BOT_COMMANDS } from './command.enum';
import interactionHandler from './interactionHandler';
import { MESSAGE } from './message.enum';
import telegramClient from './smartNotesTelegram.client';

telegramClient.on('message', async (messageInfo) => {
	const message = messageInfo.text as string;
	const chatId = messageInfo.chat.id;

	if (config.isOffline) {
		await telegramClient.sendMessage(chatId, MESSAGE.BOT_OFFLINE);
		return;
	}

	if (messageInfo.reply_to_message?.from?.is_bot || messageInfo.from?.is_bot) {
		console.warn(
			`[SKIP] abort processing message since this is reply for bot message "${messageInfo.reply_to_message?.text}"`,
		);
		return;
	}

	if (message === BOT_COMMANDS.START) {
		await interactionHandler.start(messageInfo);
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

	if (message === BOT_COMMANDS.SWITCH_MODE) {
		await interactionHandler.switchChatMode(messageInfo);
		return;
	}

	await interactionHandler.seamless(messageInfo);
});
