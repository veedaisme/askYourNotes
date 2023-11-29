import { VECTOR_COLLECTION_NAME } from "../constants";
import vectorDbClient from "../vectorDb";
import IContextService from "../model/IContextService";

class JagoContextService extends IContextService {
  collectionName = VECTOR_COLLECTION_NAME.JAGO;
  db = vectorDbClient;

  constructor() {
    super(VECTOR_COLLECTION_NAME.JAGO);
  }
}

export default JagoContextService;

