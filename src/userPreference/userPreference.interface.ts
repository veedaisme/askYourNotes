export type IChatMode = 'input' | 'chat';

export interface IUserPreferences {
	customerId: string;
	chatMode: IChatMode;
}
