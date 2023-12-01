import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import IContextService from '../model/IContextService';
import SmartNotesContext from './SmartNotesContext.service';
import { IMetadataInput } from './smartNotes.interface';
import IBaseLLMProcessor from '../model/IBaseLLMProcessor';
import OpenAiClient from '../llm/openai/openai.client';
import UserQuery from '../model/UserQuery';
import SystemQuery from '../model/SystemQuery';

dayjs.extend(utc)

// TODO(fakhri): implement interface for service
class SmartNotesService {
  private contextService: IContextService;
  private llmProcessor: IBaseLLMProcessor;

  constructor() {
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

    const systemQuery = new SystemQuery('You are my Smart Notes Assistant. Please analyze my notes related ' + 
    'and provide a comprehensive summary that includes the key facts, highlights any existing relationships between them, ' + 
    'and offers insightful interpretations based on the information I have recorded. You should use the provided documents ' + 
    'delimited by triple quotes to answer a sentence from me. If the answer cannot be found in the documents, ' + 
    'answer with "My analysis based on your notes is inconclusive. Further information or research is required for a definitive answer." ' + 
    'without saying you could not found any reference from document');

    const answer = await this.llmProcessor.setSystemQuery(systemQuery).setUserQuery(userQuery).exec();

    return answer;
  }
}

export default SmartNotesService;