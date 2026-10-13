CREATE TABLE `importaciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`archivo` text NOT NULL,
	`total` integer NOT NULL,
	`nuevos` integer NOT NULL,
	`actualizados` integer NOT NULL,
	`desactivados` integer NOT NULL,
	`creada_en` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `productos` ADD `stock` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `productos` ADD `categoria` text;