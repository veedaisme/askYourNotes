import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

class SmartNotesUtils {
    static enrichNotesWithMetadata(note: string) {
        const enrichedNoteWithDateTime = `[${dayjs().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')}] ${note}`;

        return enrichedNoteWithDateTime;
    }
}

export default SmartNotesUtils;
