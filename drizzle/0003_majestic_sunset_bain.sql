CREATE TABLE `deliveries` (
	`order_id` text PRIMARY KEY NOT NULL,
	`driver_id` text NOT NULL,
	`state` text NOT NULL,
	`instructions` text NOT NULL,
	`driver_note` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `driver_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`driver_id` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`code_hash` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drivers_username_unique` ON `drivers` (`username`);