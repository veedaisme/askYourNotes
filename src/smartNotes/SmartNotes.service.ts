import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import SmartNotesContext from './SmartNotesContext.service';
import { IMetadataInput, ISmartNotesService } from './smartNotes.interface';
import OpenAiClient from '../llm/openai/openai.client';
import UserQuery from '../model/UserQuery';
import SystemQuery from '../model/SystemQuery';

dayjs.extend(utc)

class SmartNotesService implements ISmartNotesService {
  private contextService: SmartNotesContext;
  private llmProcessor: OpenAiClient;

  constructor() {
    this.contextService = new SmartNotesContext();
    this.llmProcessor = new OpenAiClient();
  }

  async addNote(note: string, metadata: IMetadataInput, summary?: string) {
    const currentDate = dayjs().utc().format();

    // TODO(fakhri): potentally add summary on the notes
    const noteWithAdditionalInfo = `
    date: ${currentDate} in UTC

    notes: ${note}.

    ${summary ? `summary: ${summary}.` : ''}
    `;

    await this.contextService.addReference(noteWithAdditionalInfo, metadata);
  }

  private async isSaveNoteInstruction(query: string) {
    const userQuery = new UserQuery(query);

    const systemQuery = new SystemQuery('answer with 1 word "true" or "false" whether the user wants to save notes or ask you about their notes');

    const answer = await this.llmProcessor.setSystemQuery(systemQuery).setUserQuery(userQuery).exec();

    return answer.toLowerCase() === 'true';
  }

  private async summarize(query: string) {
    const userQuery = new UserQuery(query).wrapWith('"""');

    const systemQuery = new SystemQuery('You will be provided with a text delimited by triple quotes. first, summary a text what is the topic. second get the keywords from the text. only response with JSON string consisting of summary and keywords keys');

    const summaryLlmProcessor = new OpenAiClient();
    const answer = await summaryLlmProcessor.setSystemQuery(systemQuery).setUserQuery(userQuery).setModel('gpt-3.5-turbo-1106').setOutputFormat('json_object').exec();

    let summary;

    try {
      summary = JSON.parse(answer);
    } catch (error) {
      console.warn(`failed on parsing summary from json with answer: ${answer}`);
      summary = {
        summary: query,
        keywords: []
      }
    }

    return summary;
  }

  async askNote(query: string, metadata: IMetadataInput): Promise<string> {

    const contextQuery = await this.summarize(query);

    // TODO(fakhri): enhance metadata identifier for query to context
    const context = await this.contextService.query(contextQuery.summary, { identifier: metadata.identifier }, contextQuery.keywords);

    const userQuery = new UserQuery(query).withContext(context);

    const systemQuery = new SystemQuery('You are my Smart Notes Assistant. Please analyze my notes, ' +
      'provide a concise summary that includes the key facts, highlights any existing relationships between them and even giving me additional feedback based on it' +
      'You could use the provided information from my notes document delimited by triple quotes to answer a sentence from me. ' +
      'If the answer cannot be found in the documents, ' +
      'answer with sincere and friendly tone then suggest me that i can input the note as a new note ' +
      'without saying you could not found any reference from my notes document.');

    const answer = await this.llmProcessor.setSystemQuery(systemQuery).setUserQuery(userQuery).exec();

    return answer;
  }

  async seamless(query: string, metadata: IMetadataInput) {
    const isSaveNote = await this.isSaveNoteInstruction(query);

    if (isSaveNote) {
      const { summary } = await this.summarize(query);

      await this.addNote(query, metadata, summary);

      return true;
    }

    return false;
  }

  async seamlessQuestion(query: string, metadata: IMetadataInput) {
    return await this.askNote(query, metadata);
  }
}

export default SmartNotesService;