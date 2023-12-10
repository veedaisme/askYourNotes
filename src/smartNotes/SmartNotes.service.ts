import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import SmartNotesContext from './SmartNotesContext.service';
import { ISeamlessResponse, ISmartNotesService } from './smartNotes.interface';
import OpenAiClient from '../llm/openAi/openAi.client';
import UserQuery from '../model/UserQuery';
import SystemQuery from '../model/SystemQuery';
import { Metadata } from '../vectorDb/vectorDb.interface';
import { IContextSource } from '../constants';

dayjs.extend(utc)

class SmartNotesService implements ISmartNotesService {
  private contextService: SmartNotesContext;
  private llmProcessor: OpenAiClient;

  constructor() {
    this.contextService = new SmartNotesContext();
    this.llmProcessor = new OpenAiClient();
  }

  async addNote(note: string, identifier: string, source: IContextSource, metadata: Metadata) {
    const { summary, keywords } = await this.summarize(note);

    const noteWithAdditionalInfo = `notes: ${note}.

    ${keywords.length > 0 ? `keywords: ${keywords.join(', ')}.` : ''}
    `;

    // TODO(fakhri): add keywords to db
    await this.contextService.addReference({
      source,
      summary,
      document: noteWithAdditionalInfo,
      type: 'text',
      metadata: metadata,
      customerId: identifier,
    });
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

  private async sanitizeNotes(text: string) {
    const systemQuery = new SystemQuery("Remove a word that indicating the user want to save the text");

    const userQuery = new UserQuery(text);

    const answer = await this.llmProcessor.setSystemQuery(systemQuery).setUserQuery(userQuery).exec();

    return answer;
  }

  async askNote(query: string, identifier: string): Promise<string> {

    const contextQuery = await this.summarize(query);

    // TODO(fakhri): enhance metadata / keywords embedding identifier for query to context
    const context = await this.contextService.ask({
      query: contextQuery.summary,
      customerId: identifier   
    });

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

  async seamless(query: string, identifier: string, source: IContextSource): Promise<ISeamlessResponse> {
    // const isSaveNote = await this.isSaveNoteInstruction(query);

    // if (isSaveNote) {
      // const sanitizedNotes = await this.sanitizeNotes(query);

      await this.addNote(query, identifier, source, {});

      return {
        isSaveNote: true,
        answer: query
      };
    }

    // const answer = await this.askNote(query, identifier);
    
    // return {
    //   answer,
    //   isSaveNote,
    // }
  // }
}

export default SmartNotesService;