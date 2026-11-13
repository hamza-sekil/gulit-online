-- Delivery fees (owner, 13 Nov 2026): 200 birr up to 3 km, +100 birr every 3 km after that (before VAT). Runs once.
INSERT INTO settings (key, value, updated_at)
SELECT 'delivery_zones', '[{"upToKm":3,"fee":20000},{"upToKm":6,"fee":30000},{"upToKm":9,"fee":40000},{"upToKm":12,"fee":50000},{"upToKm":15,"fee":60000},{"upToKm":null,"fee":70000,"stepKm":3,"stepFee":10000}]', 1794560000000
 WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'once:2026-11-13-delivery-zones')
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('once:2026-11-13-delivery-zones', '1', 1794560000000);
