ALTER TABLE `stores` ADD `chapa_subaccount` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `commission_bps` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
CREATE TABLE `payment_attempts` (
	`tx_ref` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`party` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`status` text NOT NULL,
	`provider_ref` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `payment_attempts_order_idx` ON `payment_attempts` (`order_id`);
