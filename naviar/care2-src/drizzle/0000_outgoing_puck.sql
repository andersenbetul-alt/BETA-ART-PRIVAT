CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`slot` text NOT NULL,
	`locale` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`key` text NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	`payment` text DEFAULT 'none' NOT NULL,
	`session` text,
	`amount` integer DEFAULT 10000 NOT NULL,
	`currency` text DEFAULT 'nok' NOT NULL,
	FOREIGN KEY (`slot`) REFERENCES `slots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_active_slot` ON `bookings` (`slot`) WHERE "bookings"."status" = 'active';--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_owner_key` ON `bookings` (`owner`,`key`);--> statement-breakpoint
CREATE INDEX `bookings_owner` ON `bookings` (`owner`);--> statement-breakpoint
CREATE TABLE `consent_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`choice` text NOT NULL,
	`version` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`day` text NOT NULL,
	`page` text NOT NULL,
	`locale` text NOT NULL,
	`kind` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `page`, `locale`, `kind`)
);
--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`booking` text NOT NULL,
	`kind` text NOT NULL,
	`locale` text NOT NULL,
	`starts` integer NOT NULL,
	`created` integer NOT NULL,
	`state` text DEFAULT 'preview' NOT NULL,
	`providerId` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`booking`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `slots` (
	`id` text PRIMARY KEY NOT NULL,
	`starts` integer NOT NULL,
	`ends` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created` integer NOT NULL,
	`kind` text NOT NULL
);
