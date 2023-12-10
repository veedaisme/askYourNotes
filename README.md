# askYourNotes

askYourNotes is a Telegram bot designed to streamline note-taking and retrieval. It leverages [MongoDB Atlas Search](https://www.mongodb.com/atlas/search) as a vector database for efficient storage and retrieval of notes, and it integrates OpenAI's powerful LLM to enhance search capabilities, providing a more intelligent and personalized assistant experience.

Note: 
- You can easily replace OpenAI with other LLM processors such as Hugging Face, Ollama, etc., based on your preferences.
- You can easily replace the vector DB as a source of your data

## Features

- Store and Search through your notes using keywords or phrases to quickly find the information you need.
- Leverage LLM (Large Language Model) capabilities to delivers more than just simple search results. It understands the context of your queries and provides insightful responses.

## Installation

To install and run askVeedaBot on your local machine, follow these steps:

1. Clone the repository:

```shell
git clone https://github.com/iqbaaaaalf/askYourNotes.git
```

2. Install the required dependencies:
```
cd askVeedaBot
npm install
```
3. Configure the bot:

[Create a new Telegram bot](https://core.telegram.org/bots/tutorial) and obtain the API token.

OpenAI API key is required since we are using the embedding function `text-embedding-ada-002` of openAI
```
export OPENAI_KEY=your_openai_api_key
export TELEGRAM_TOKEN=your_telegram_bot_token
export MONGO_USER=your_mongodb_user
export MONGO_PASSWORD=your_mongodb_password

```

4. Start the bot:
```
npm start:notes
```

# Additional notes

1. **Two Projects in One**: This repository consists of two projects, AskYourNotes and Tanya Jago Bot (deprecated).
2. **Learning and Exploration**: The primary purpose of this repository is as a learning project, exploring the concept of note-taking via chat. The idea is to adapt to the common practice of storing information in chat interfaces.