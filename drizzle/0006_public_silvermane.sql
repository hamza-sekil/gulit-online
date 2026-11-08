CREATE TABLE `engineer_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`engineer_id` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `engineers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`code_hash` text NOT NULL,
	`skills` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`available` integer DEFAULT 0 NOT NULL,
	`location` text,
	`location_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `engineers_username_unique` ON `engineers` (`username`);--> statement-breakpoint
CREATE TABLE `service_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`trade` text NOT NULL,
	`engineer_id` text,
	`state` text NOT NULL,
	`payload` text NOT NULL,
	`note` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
