const Telegram = require('node-telegram-bot-api');

const credentials = require('./creds');

const bot = new Telegram(credentials.telegramToken, { polling: true });

bot.on('message', async function (message) {
    const prompt = message.text
    // Construct the request payload
    const payload = {
        messages: [ 
            // { "role": "system", "content": "Always answer in rhymes." },
            { "role": "user", "content": prompt }
          ],
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
    let response;

    try {
        response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });
    } catch (error) { 
        console.log(error);

        return;
    }

    const responseJson = await response.json()

    const generatedText = responseJson.choices[0].text;
    await bot.sendMessage(message.chat.id, generatedText);

});

bot.on('polling_error', (error) => {
    console.log(error)
})