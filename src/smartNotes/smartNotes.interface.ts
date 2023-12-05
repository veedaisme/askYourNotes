export interface IMetadataInput {
  identifier: string,
  source?: 'telegram'
}

export abstract class ISmartNotesService {
  abstract addNote(note: string, metadata: IMetadataInput): Promise<void>;

  abstract askNote(query: string, metadata: IMetadataInput): Promise<string>;
}