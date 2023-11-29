import telegramClient from "./jagoTelegram.client"

telegramClient.on('polling_error', (error) => {
  console.log(error)
})