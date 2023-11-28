import telegramClient from "./client"

telegramClient.on('polling_error', (error) => {
  console.log(error)
})