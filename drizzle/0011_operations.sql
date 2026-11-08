ALTER TABLE `stores` ADD `open_time` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `close_time` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `radius_km` real;--> statement-breakpoint
ALTER TABLE `stores` ADD `contact_phone` text;--> statement-breakpoint
ALTER TABLE `drivers` ADD `grp` text DEFAULT 'own' NOT NULL;--> statement-breakpoint
ALTER TABLE `drivers` ADD `trip_fee` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `drivers` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `drivers` ADD `available` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `drivers` ADD `lat` real;--> statement-breakpoint
ALTER TABLE `drivers` ADD `lng` real;--> statement-breakpoint
ALTER TABLE `drivers` ADD `location_at` integer;--> statement-breakpoint
ALTER TABLE `deliveries` ADD `provider` text DEFAULT 'own' NOT NULL;--> statement-breakpoint
ALTER TABLE `deliveries` ADD `cost_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `deliveries` ADD `assigned_by` text DEFAULT 'owner' NOT NULL;
