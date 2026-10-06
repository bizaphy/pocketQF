CREATE TABLE `productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` text NOT NULL,
	`nombre` text NOT NULL,
	`laboratorio` text,
	`activo` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `productos_sku_unique` ON `productos` (`sku`);--> statement-breakpoint
CREATE TABLE `vencimientos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`lote` text NOT NULL,
	`fecha_vencimiento` text NOT NULL,
	`cantidad` integer NOT NULL,
	`ultima_revision` integer NOT NULL,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_vencimientos_fecha` ON `vencimientos` (`fecha_vencimiento`);--> statement-breakpoint
CREATE INDEX `idx_vencimientos_producto` ON `vencimientos` (`producto_id`);