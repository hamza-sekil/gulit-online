CREATE TABLE `store_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `store_stock` (
	`store_id` text NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`manufacturing_date` text,
	`expiry_date` text,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL,
	PRIMARY KEY(`store_id`, `product_id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`code_hash` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_username_unique` ON `stores` (`username`);--> statement-breakpoint
ALTER TABLE `products` ADD `manufacturing_date` text;--> statement-breakpoint
ALTER TABLE `products` ADD `expiry_date` text;