import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import SmartNotesContext from './SmartNotesContext.service';
import { IMetadataInput, ISmartNotesService } from './smartNotes.interface';
import IBaseLLMProcessor from '../model/IBaseLLMProcessor';
import OpenAiClient from '../llm/openai/openai.client';
import UserQuery from '../model/UserQuery';
import SystemQuery from '../model/SystemQuery';

dayjs.extend(utc)

/**
 * smart notes business logic implemented using langchain
 */
class SmartNotesChainService extends ISmartNotesService {
  private contextService: SmartNotesContext;
  private llmProcessor: IBaseLLMProcessor;

  constructor() {
    super();

    this.contextService = new SmartNotesContext();
    this.llmProcessor = new OpenAiClient();
  }

  async addNote(note: string, metadata: IMetadataInput) {
    const currentDate = dayjs().utc().format();

    // TODO(fakhri): potentally add summary on the notes
    const noteWithAdditionalInfo = `
    date: ${currentDate} in UTC

    notes: ${note}.
    `;

    await this.contextService.addReference(noteWithAdditionalInfo, metadata);
  }

  private async getQueryToContextService(query: string): Promise<string> {
    const userQuery = new UserQuery(query);

    const systemQuery = new SystemQuery('You are excel at summarizing questions concisely and effectively for querying the vector database');

    const answer = await this.llmProcessor.setSystemQuery(systemQuery).setUserQuery(userQuery).exec();

    return answer;
  }

  async askNote(query: string, metadata: IMetadataInput): Promise<string> {

    const contextQuery = await this.getQueryToContextService(query);

    // TODO(fakhri): enhance metadata identifier for query to context
    const context = await this.contextService.query(contextQuery, { identifier: metadata.identifier });

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
}

export default SmartNotesChainService;