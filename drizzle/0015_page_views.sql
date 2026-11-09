CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`at` integer NOT NULL,
	`day` text NOT NULL,
	`path` text NOT NULL,
	`source` text NOT NULL,
	`device` text NOT NULL,
	`visitor` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `page_views_day_idx` ON `page_views` (`day`);
