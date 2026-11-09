-- The channel link changed from @heksupermarket to @gulitonline1. Runs once.
UPDATE settings SET value = json_set(value, '$.channel', '@gulitonline1'), updated_at = 1794254400000
 WHERE key = 'telegram' AND NOT EXISTS (SELECT 1 FROM settings WHERE key = 'once:2026-11-09b-telegram-channel');
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('once:2026-11-09b-telegram-channel', '1', 1794254400000);
