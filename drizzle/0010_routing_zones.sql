ALTER TABLE `stores` ADD `lat` real;--> statement-breakpoint
ALTER TABLE `stores` ADD `lng` real;--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
