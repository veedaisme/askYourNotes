import { IChatMode } from './userPreference.interface';
import UserPreferenceRepository from './userPreference.repository';

class UserPreferenceService {
	private userPreferenceRepository: UserPreferenceRepository;

	constructor() {
		this.userPreferenceRepository = new UserPreferenceRepository();
	}

	async getChatMode(customerId: string): Promise<IChatMode> {
		const { chatMode } =
			await this.userPreferenceRepository.getPreferences(customerId);

		return chatMode;
	}

	async switchChatMode(customerId: string): Promise<IChatMode> {
		const { chatMode } =
			await this.userPreferenceRepository.getPreferences(customerId);

		const newChatMode = chatMode === 'input' ? 'chat' : 'input';

		await this.userPreferenceRepository.updatePreferences(customerId, {
			chatMode: newChatMode,
		});

		return newChatMode;
	}
}

export default UserPreferenceService;
