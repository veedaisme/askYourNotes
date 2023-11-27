const axios = require('axios');
const fs = require('fs');
const Telegram = require('node-telegram-bot-api');
const { getCollection } = require('./db'); 
const { VECTOR_COLLECTION_NAME, TELEGRAM_INLINE_BUTTON_ACTION } = require('./constants'); 

const credentials = require('./creds');

const bot = new Telegram(credentials.telegramToken, { polling: true });

const config = {
  isAdminOnly: process.env.isAdminMode === 'true' || false,
  knowledgeFileName: 'baseKnowledge/raw.json',
  flattenKnowledgeFileName: 'baseKnowledge/flatten.json',
  // baseUrl: "https://chat.hooman.live",
  baseUrl: "http://192.168.68.120:1234",
  timeout: 600000,
  isStream: process.env.isStream === 'true' || false,
  isOffline: false
}

const getContext = async (query) => {
  const collection = await getCollection(VECTOR_COLLECTION_NAME.JAGO);
  
  const results = await collection.query({
    nResults: 5,
    queryTexts: [query],
    include: [ "documents" ]
  });

  const context = results.documents[0].join(' ');

  return {
    role: 'system',
    content: context
  }
}

const getPreContext = async (query) => {
  const queryBasedContext = await getContext(query);

  const content = "You are 'Tanya Jago Support', a helpful and knowledgeable assistant. Your goal is to provide accurate and relevant information based on your training data. If a user asks a question that falls outside your knowledge or context, respond with, 'I'm sorry, I don't have enough information on that topic to provide a reliable answer. If you have other questions or need assistance within my knowledge base, feel free to ask!'. these are additional information about bank jago that could help you to do you job properly. " + queryBasedContext.content;

  const systemPrompt = [
    {
      role: "system",
      content
    },
  ];

  return systemPrompt;
}

const processAdmin = (messageInfo) => {
  const message = messageInfo.text.replace(/(\w)$/, '$1.');

  const existingData =
    fs.readFileSync(config.knowledgeFileName, 'utf8');
  const dataArray = JSON.parse(existingData);

  const templateAdmin = { "role": "system", "content": message }

  dataArray.push(templateAdmin);

  fs.writeFileSync(config.knowledgeFileName, JSON.stringify(dataArray, null, 2));
}

const getTextCompletion = async (query) => {
  const context = await getPreContext(query);

  // Construct the request payload
  const payload = {
    messages: [
      ...context,
      { "role": "user", "content": query }
    ],
    temperature: 0.7,
    max_tokens: -1,
    stream: false
  };

  const url = `${config.baseUrl}/v1/chat/completions`;

  const headers = {
    "Content-Type": "application/json",
  };

  let response;

  try {
    response = await axios.post(url, payload, {
      headers,
      timeout: config.timeout
    });
  } catch (error) {
    console.log(error);

    return;
  }

  return response.data.choices[0].message.content;
}

const processCustomer = async (query, messageInfo) => {
  const generatedText = await getTextCompletion(query)

  await bot.sendMessage(messageInfo.chat.id, generatedText);
}

const processCustomerStream = async (messageInfo) => {
  const message = messageInfo.text

  const context = await getPreContext(message);

  // Construct the request payload
  const payload = {
    messages: [
      ...context,
      { "role": "user", "content": message }
    ],
    temperature: 0.7,
    max_tokens: -1,
    stream: true
  };

  const url = `${config.baseUrl}/v1/chat/completions`;

  const headers = {
    "Content-Type": "application/json",
  };

  let response;

  try {
    response = await axios.post(url, payload, {
      headers,
      timeout: config.timeout,
      responseType: 'stream'
    });
  } catch (error) {
    console.log(error);

    return;
  }

  const stream = response.data;

  let chatResponse = '';
  
  const repliedMessage = await bot.sendMessage(messageInfo.chat.id, 'thinking ...');

  const repliedOptions = {
    messageId: repliedMessage.message_id,
    chatId: messageInfo.chat.id,
  }

  stream.on('data', async data => {
    const dirtyChunk = data.toString();
    let chunk = dirtyChunk.replace(/^data: /, "");
    chunk = JSON.parse(chunk);
    const generatedText = chunk.choices[0].delta.content;

    chatResponse += `${generatedText}`;

    if (chatResponse === generatedText) {
      // nothing change on the message, no need to update
      return;
    }

    if (!generatedText) {
      return;
    }

    if (!generatedText.trim().length) {
      console.log('generatedText is empty!');
      return;
    }

    try {
      await bot.editMessageText(chatResponse, { message_id: repliedOptions.messageId, chat_id: repliedOptions.chatId });
    } catch(error) {
      console.log(`error - current chat response, generatedTex: ${generatedText}`)
    }
  });

  stream.on('end', async () => {
    await bot.editMessageText(chatResponse, { message_id: repliedOptions.messageId, chat_id: repliedOptions.chatId });  
    console.log("stream done");
  });
}

const processMessage = async (messageInfo) => {
  const message = messageInfo.text;
  if (config.isOffline){
    await bot.sendMessage(messageInfo.chat.id, 'bot is offline. comeback later ehehe ...');
  }

  if (config.isAdminOnly) {
    processAdmin(messageInfo)
    return;
  }

  if (message.includes('admin')) {
    const formattedMessage = message.replace('admin', '');
    processAdmin(formattedMessage)
    return;
  }

  if (config.isStream) {
    await processCustomerStream(messageInfo);
    return;
  }

  await processCustomer(messageInfo.text, messageInfo)
  return;
}

const buttons = [
  [
    { text: "I'm Jago User", callback_data: TELEGRAM_INLINE_BUTTON_ACTION.USER_START },
    { text: "I'm Admin", callback_data: TELEGRAM_INLINE_BUTTON_ACTION.ADMIN_START }
  ]
];

const inlineKeyboardMarkup = {
  inline_keyboard: buttons
};

bot.on('message', async function (messageInfo) {
  const message = messageInfo.text

  if (message === '/start') {
    await bot.sendMessage(messageInfo.chat.id, 'Hi :)', {reply_markup: inlineKeyboardMarkup});
    return;
  }

  await processMessage(messageInfo);
});

bot.on('polling_error', (error) => {
  console.log(error)
})

bot.on('callback_query', async (callbackQuery) => {
  const callbackData = callbackQuery.data;

  if (callbackData === TELEGRAM_INLINE_BUTTON_ACTION.USER_START) {
    await processCustomer('Hi, Tanya Jago?', callbackQuery.message);
    await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
    return;
  }

  if (callbackData === TELEGRAM_INLINE_BUTTON_ACTION.ADMIN_START) {
    await bot.sendMessage(callbackQuery.message.chat.id, 'hi veeda, coming soon ...');
    await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
    return;
  }

  bot.answerCallbackQuery(callbackQuery.id);
});