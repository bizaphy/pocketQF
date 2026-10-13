CREATE TABLE `inventario_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inventario_id` integer NOT NULL,
	`producto_id` integer NOT NULL,
	`stock_sistema` integer NOT NULL,
	`contado` integer,
	`contado_en` integer,
	FOREIGN KEY (`inventario_id`) REFERENCES `inventarios`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_items_inventario` ON `inventario_items` (`inventario_id`);--> statement-breakpoint
CREATE INDEX `idx_items_producto_contado` ON `inventario_items` (`producto_id`,`contado_en`);--> statement-breakpoint
CREATE TABLE `inventarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`modo` text NOT NULL,
	`categoria` text,
	`creado_en` integer NOT NULL,
	`finalizado_en` integer
);
