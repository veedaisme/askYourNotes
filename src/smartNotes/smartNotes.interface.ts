import { IContextSource } from '../constants';
import { Metadata } from '../vectorDb/vectorDb.interface';

export abstract class ISmartNotesService {
	abstract addNote(
		note: string,
		identifier: string,
		source: IContextSource,
		metadata: Metadata,
	): Promise<void>;

	abstract askNote(
		query: string,
		identifier: string,
		metadata: Metadata,
	): Promise<string>;
}

export interface ISeamlessResponse {
	answer: string;
	isSaveNote: boolean;
}
