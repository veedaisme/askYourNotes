const Telegram = require('node-telegram-bot-api');

const credentials = require('./creds');

const bot = new Telegram(credentials.telegramToken);

bot.message_handler(function(message) {
   // Construct the request payload
  const payload = {
    prompt,
    temperature: 0.7,
    max_tokens: -1,
    stream: false
  };

  // Set the API endpoint URL
  const url = "http://localhost:1234/v1/chat/completions";

  // Set the authorization header with your API key
  const headers = {
    // Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // Send the POST request to the OpenAI API
  fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      const generatedText = data.choices[0].text;
      bot.sendMessage(message.chat.id, generatedText);
    })
    .catch((error) => {
      console.error("Error:", error);
      bot.sendMessage(message.chat.id, "An error occurred. Please try again.");
    });
  });