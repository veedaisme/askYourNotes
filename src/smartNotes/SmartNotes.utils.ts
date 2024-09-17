import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

const enrichNotesWithMetadata = (note: string) => {
	const enrichedNoteWithDateTime = `[${dayjs()
		.tz('Asia/Jakarta')
		.format('YYYY-MM-DD HH:mm:ss')}] ${note}`;

	return enrichedNoteWithDateTime;
};

const SmartNotesUtils = {
	enrichNotesWithMetadata,
};

export default SmartNotesUtils;
