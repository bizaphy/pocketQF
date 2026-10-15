CREATE TABLE `estantes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`zona_id` integer NOT NULL,
	`nombre` text NOT NULL,
	`detalle` text,
	`tipo` text DEFAULT 'estante' NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`ancho` integer NOT NULL,
	`alto` integer NOT NULL,
	FOREIGN KEY (`zona_id`) REFERENCES `zonas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_estantes_zona` ON `estantes` (`zona_id`);--> statement-breakpoint
CREATE TABLE `repisas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`estante_id` integer NOT NULL,
	`numero` integer NOT NULL,
	`contenido` text NOT NULL,
	FOREIGN KEY (`estante_id`) REFERENCES `estantes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_repisas_estante_numero` ON `repisas` (`estante_id`,`numero`);--> statement-breakpoint
CREATE TABLE `zonas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`creada_en` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `zonas_nombre_unique` ON `zonas` (`nombre`);