// Only these notification TYPES surface in the bell dropdown, unread
// count, and toasts. Everything else (battle_result, streak_updated,
// achievement_unlocked, chat_message) still gets written to Mongo/Firebase
// for internal use (e.g. chat inbox refresh) but never shows here.
export const VISIBLE_NOTIFICATION_TYPES = ["friend_request"];
export default VISIBLE_NOTIFICATION_TYPES;