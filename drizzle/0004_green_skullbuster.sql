CREATE TABLE `order_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`sender` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
