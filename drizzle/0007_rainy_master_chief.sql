CREATE TABLE `engineer_push` (
	`id` text PRIMARY KEY NOT NULL,
	`engineer_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`session_hash` text NOT NULL,
	`updated_at` integer NOT NULL
);
