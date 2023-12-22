import { Collection } from 'mongodb';
import { DB_COLLECTION_NAME } from '../constants';
import mongoDbClient from '../mongodb/mongoClient';
import { IUserPreferences } from './userPreference.interface';

class UserPreferenceRepository {
	private dbClient = mongoDbClient;
	private readonly dbName = 'note_db';
	private readonly collectionName = DB_COLLECTION_NAME.USER_PREFERENCES;
	private collectionInstance: Collection<IUserPreferences>;

	private defaultPreferences: IUserPreferences = {
		customerId: '',
		chatMode: 'chat',
	};

	constructor() {
		const db = this.dbClient.db(this.dbName);
		this.collectionInstance = db.collection(this.collectionName);
	}

	private async insertDefaultPreferences(customerId: string) {
		await this.collectionInstance.insertOne({
			...this.defaultPreferences,
			customerId: customerId,
		});
	}

	async getPreferences(customerId: string): Promise<IUserPreferences> {
		const preferences = await this.collectionInstance.findOne({ customerId });

		if (!preferences) {
			console.info(`Initiating default preferences for ${customerId}`);

			await this.insertDefaultPreferences(customerId);

			return {
				...this.defaultPreferences,
				customerId,
			};
		}

		return preferences;
	}

	async updatePreferences(
		customerId: string,
		preferences: Partial<IUserPreferences>,
	): Promise<void> {
		await this.collectionInstance.updateOne(
			{ customerId },
			{
				$set: preferences,
			},
		);
	}
}

export default UserPreferenceRepository;
