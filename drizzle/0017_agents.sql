CREATE TABLE `agent_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payload` text NOT NULL,
	`manage_hash` text,
	`paid_ref` text,
	`note` text DEFAULT '' NOT NULL,
	`featured` integer DEFAULT 0 NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE INDEX `agent_posts_status_idx` ON `agent_posts` (`status`);--> statement-breakpoint
CREATE TABLE `agent_people` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`post_id` text,
	`status` text DEFAULT 'new' NOT NULL,
	`payload` text NOT NULL,
	`note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_people_post_idx` ON `agent_people` (`post_id`);--> statement-breakpoint
INSERT INTO `agent_posts` (`id`,`created_at`,`status`,`payload`,`note`,`featured`) VALUES ('AG-PULITO',1795017600000,'live','{"company": "Pulito Soap", "product": "Pulito soap (factory direct)", "category": "Household & cleaning", "model": "Buy & resell", "cities": ["All Ethiopia"], "coverage": "All regions except Bale and Gamo Gofa. First: Adama, Hawassa, Bahir Dar, Dire Dawa.", "terms": "Buy Pulito soap at the factory wholesale price, sell to shops and kiosks in your city and keep the profit.", "needs": "A shop, store or small warehouse in your city, and a phone. Experience selling to shops is a plus.", "contactName": "Gulit Online", "phone": "0909225566", "description": "Pulito is an Ethiopian soap made from raw materials in our own factory. We are looking for one or more agents in each city to buy and distribute Pulito to shops, kiosks and supermarkets."}','Gulit own brand',1);