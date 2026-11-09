-- Telegram: 2 posts a day (12:00 and 19:00 Addis), restart the rotation at the new picture/video posts. Runs once.
UPDATE settings SET value = json_set(value, '$.everyHours', 7, '$.startHour', 12, '$.endHour', 19, '$.next', 0), updated_at = 1794240000000
 WHERE key = 'telegram' AND NOT EXISTS (SELECT 1 FROM settings WHERE key = 'once:2026-11-09-telegram');
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('once:2026-11-09-telegram', '1', 1794240000000);
