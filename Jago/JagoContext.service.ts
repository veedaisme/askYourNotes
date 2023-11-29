import { IncludeEnum } from "chromadb";
import { v4 as uuidv4 } from 'uuid';

import { VECTOR_COLLECTION_NAME } from "../constants";
import vectorDbClient from "../vectorDb";
import { Metadata } from "../vectorDb/vectorDb.interface";
import IContextService from "../model/IContextService";

class JagoContextService extends IContextService {
  collectionName = VECTOR_COLLECTION_NAME.JAGO;
  db = vectorDbClient;

  constructor() {
    super(VECTOR_COLLECTION_NAME.JAGO);
  }
}

export default JagoContextService;

