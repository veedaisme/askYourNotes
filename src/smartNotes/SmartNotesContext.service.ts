import { VECTOR_COLLECTION_NAME } from "../constants";
import ChromaContext from "../context/Chromadb.context";
import { Metadata } from "../vectorDb/vectorDb.interface";
import { IMetadataInput } from "./smartNotes.interface";

class SmartNotesContext extends ChromaContext {
  private metadataConstant = {
    context: 'notes',
    type: 'text'
  }

  constructor() {
    super(VECTOR_COLLECTION_NAME.SMART_NOTES);
  } 

  async addReference(document: string, metadataInput: IMetadataInput): Promise<void> {
    const { identifier, source } = metadataInput 

    const metadata: Metadata = {
      context: this.metadataConstant.context,
      type: this.metadataConstant.type,
    }

    if (identifier) {
      metadata.identifier = identifier
    }

    if (source) {
      metadata.source = source
    }

    await this.addReferences([document], metadata);
  }
}

export default SmartNotesContext;