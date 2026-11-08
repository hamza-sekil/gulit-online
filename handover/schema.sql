-- Gulit v26 final EMPTY schema. Alternative to replaying migrations, not a data export.
-- Do not execute against an existing production database.

CREATE TABLE `admin_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`until` integer NOT NULL
);

CREATE TABLE `admin_credentials` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`salt` text NOT NULL,
	`password_hash` text NOT NULL
);

CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);

CREATE TABLE `deliveries` (
	`order_id` text PRIMARY KEY NOT NULL,
	`driver_id` text NOT NULL,
	`state` text NOT NULL,
	`instructions` text NOT NULL,
	`driver_note` text NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE TABLE `driver_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`driver_id` text NOT NULL,
	`expires` integer NOT NULL
);

CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`code_hash` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);

CREATE TABLE `engineer_push` (
	`id` text PRIMARY KEY NOT NULL,
	`engineer_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`session_hash` text NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE TABLE `engineer_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`engineer_id` text NOT NULL,
	`expires` integer NOT NULL
);

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

CREATE TABLE `order_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`sender` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);

CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL
);

CREATE TABLE `products` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`price_cents` integer NOT NULL,
	`stock` integer NOT NULL,
	`image` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
, `manufacturing_date` text, `expiry_date` text);

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

CREATE TABLE `store_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`expires` integer NOT NULL
);

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

CREATE TABLE `stores` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`code_hash` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);

CREATE TABLE `support_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX `drivers_username_unique` ON `drivers` (`username`);

CREATE UNIQUE INDEX `engineers_username_unique` ON `engineers` (`username`);

CREATE UNIQUE INDEX `stores_username_unique` ON `stores` (`username`);

-- Added in version 27 (migration 0009_online_payments)
ALTER TABLE `stores` ADD `chapa_subaccount` text;
ALTER TABLE `stores` ADD `commission_bps` integer DEFAULT 100 NOT NULL;
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
CREATE INDEX `payment_attempts_order_idx` ON `payment_attempts` (`order_id`);

-- Added in version 28 (migration 0010_routing_zones)
ALTER TABLE `stores` ADD `lat` real;
ALTER TABLE `stores` ADD `lng` real;
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);

-- Added in version 29 (migration 0011_operations)
ALTER TABLE `stores` ADD `open_time` text;
ALTER TABLE `stores` ADD `close_time` text;
ALTER TABLE `stores` ADD `radius_km` real;
ALTER TABLE `stores` ADD `contact_phone` text;
ALTER TABLE `drivers` ADD `grp` text DEFAULT 'own' NOT NULL;
ALTER TABLE `drivers` ADD `trip_fee` integer DEFAULT 0 NOT NULL;
ALTER TABLE `drivers` ADD `phone` text;
ALTER TABLE `drivers` ADD `available` integer DEFAULT 0 NOT NULL;
ALTER TABLE `drivers` ADD `lat` real;
ALTER TABLE `drivers` ADD `lng` real;
ALTER TABLE `drivers` ADD `location_at` integer;
ALTER TABLE `deliveries` ADD `provider` text DEFAULT 'own' NOT NULL;
ALTER TABLE `deliveries` ADD `cost_cents` integer DEFAULT 0 NOT NULL;
ALTER TABLE `deliveries` ADD `assigned_by` text DEFAULT 'owner' NOT NULL;

