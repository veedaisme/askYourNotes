import { VECTOR_COLLECTION_NAME } from "../constants";
import IContextService from "../model/IContextService";
import { IMetadataInput } from "./smartNotes.interface";



class SmartNotesContext extends IContextService {
  private metadataConstant = {
    context: 'notes',
    type: 'text'
  }

  constructor() {
    super(VECTOR_COLLECTION_NAME.SMART_NOTES);
  }

  async addReference(document: string, metadataInput: IMetadataInput): Promise<void> {
    const { identifier, source = 'telegram' } = metadataInput 

    const metadata = {
      identifier: identifier,
      context: this.metadataConstant.context,
      type: this.metadataConstant.type,
      source: source
    }

    await this.addReferences([document], metadata);
  }
}

export default SmartNotesContext;