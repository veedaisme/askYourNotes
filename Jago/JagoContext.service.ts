import { VECTOR_COLLECTION_NAME } from "../constants";
import IContextService from "../model/IContextService";

class JagoContextService extends IContextService {
  constructor() {
    super(VECTOR_COLLECTION_NAME.JAGO);
  }

  addReference(document: string, metadata: unknown): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default JagoContextService;

