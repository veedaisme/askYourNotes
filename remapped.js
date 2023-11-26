const fs = require('fs');

const config = {
  knowledgeFileName: 'baseKnowledge/raw.json',
  flattenKnowledgeFileName: 'baseKnowledge/flatten.json',
}

const existingData = fs.readFileSync(config.knowledgeFileName, 'utf8');
const prePrompt = JSON.parse(existingData);

const systemMessage = prePrompt.map(prompt => prompt.content).join('\n');

const newFormat = [
  {
    'role': 'system',
    'content': systemMessage
  }
]

fs.writeFileSync(config.flattenKnowledgeFileName, JSON.stringify(newFormat, null, 2));