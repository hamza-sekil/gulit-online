CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL
);
