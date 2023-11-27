const axios = require('axios');
const fs = require('fs');
const Telegram = require('node-telegram-bot-api');

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
  isOffline: true
}

const existingData = fs.readFileSync(config.flattenKnowledgeFileName, 'utf8');
const prePrompt = JSON.parse(existingData);

const processAdmin = (messageInfo) => {
  const message = messageInfo.text.replace(/(\w)$/, '$1.');

  const existingData =
    fs.readFileSync(config.knowledgeFileName, 'utf8');
  const dataArray = JSON.parse(existingData);

  const templateAdmin = { "role": "system", "content": message }

  dataArray.push(templateAdmin);

  fs.writeFileSync(config.knowledgeFileName, JSON.stringify(dataArray, null, 2));
}

const processCustomer = async (messageInfo) => {
  const message = messageInfo.text

  // Construct the request payload
  const payload = {
    messages: [
      ...prePrompt,
      { "role": "user", "content": message }
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


  const generatedText = response.data.choices[0].message.content;
  await bot.sendMessage(messageInfo.chat.id, generatedText);
}

const processCustomerStream = async (messageInfo) => {
  const message = messageInfo.text

  // Construct the request payload
  const payload = {
    messages: [
      ...prePrompt,
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

  await processCustomer(messageInfo)
  return;
}

bot.on('message', async function (messageInfo) {
  const message = messageInfo.text

  if (message === '/start') {
    return;
  }

  await processMessage(messageInfo);
});

bot.on('polling_error', (error) => {
  console.log(error)
})