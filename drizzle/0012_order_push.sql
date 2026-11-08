CREATE TABLE `order_push` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `order_push_order_idx` ON `order_push` (`order_id`);
