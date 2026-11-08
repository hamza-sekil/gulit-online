CREATE TABLE `partner_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`payload` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`store_id` text
);
