const axios = require('axios');
const fs = require('fs');
const Telegram = require('node-telegram-bot-api');

const credentials = require('./creds');

const bot = new Telegram(credentials.telegramToken, { polling: true });

const config = {
  isAdminOnly: process.env.isAdminMode === 'true' || false,
  knowledgeFileName: 'baseKnowledge/raw.json',
  flattenKnowledgeFileName: 'baseKnowledge/flatten.json',
  baseUrl: "https://chat.hooman.live",
  timeout: 600000
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

const processMessage = async (messageInfo) => {
  const message = messageInfo.text;
  if (config.isAdminOnly) {
    processAdmin(messageInfo)
    return;
  }

  if (message.includes('admin')) {
    const formattedMessage = message.replace('admin', '');
    processAdmin(formattedMessage)
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