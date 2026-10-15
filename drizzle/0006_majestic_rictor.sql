CREATE TABLE `ficha_productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ficha_id` integer NOT NULL,
	`producto_id` integer NOT NULL,
	FOREIGN KEY (`ficha_id`) REFERENCES `fichas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_ficha_producto` ON `ficha_productos` (`ficha_id`,`producto_id`);--> statement-breakpoint
CREATE TABLE `fichas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`principio_activo` text NOT NULL,
	`terminos` text,
	`indicaciones` text,
	`efectos_secundarios` text,
	`observaciones` text,
	`actualizada_en` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fichas_principio_activo_unique` ON `fichas` (`principio_activo`);