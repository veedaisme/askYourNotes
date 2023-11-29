import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import IContextService from '../model/IContextService';
import SmartNotesContext from './SmartNotesContext.service';
import { IMetadataInput } from './smartNotes.interface';

dayjs.extend(utc)

// TODO(fakhri): implement interface for service
class SmartNotesService {
  private contextService: IContextService;

  constructor() {
    this.contextService = new SmartNotesContext();
  }

  async addNote(note: string, metadata: IMetadataInput) {
    const currentDate = dayjs().utc().format();
    
    // TODO(fakhri): potentally add summary on the notes
    const noteWithAdditionalInfo = `
    date: ${currentDate} in UTC

    notes: ${note}
    `;

    await this.contextService.addReference(noteWithAdditionalInfo, metadata);
  }
}

export default SmartNotesService;