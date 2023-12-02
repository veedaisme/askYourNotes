import { VECTOR_COLLECTION_NAME } from "../constants";
import IContextService from "../model/IContextService";

class JagoContextService extends IContextService {
  constructor() {
    super(VECTOR_COLLECTION_NAME.JAGO);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addReference(_document: string, _metadata: unknown): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default JagoContextService;

