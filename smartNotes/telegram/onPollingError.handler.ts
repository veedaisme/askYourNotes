import telegramClient from "./smartNotesTelegram.client"

telegramClient.on('polling_error', (error) => {
  console.log(error)
})