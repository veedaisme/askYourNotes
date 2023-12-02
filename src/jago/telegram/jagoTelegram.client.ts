import Telegram from 'node-telegram-bot-api';

import config from '../../../config';

const { telegramToken } = config;

const telegramClient = new Telegram(telegramToken, { polling: true });

export default telegramClient;