CREATE TABLE `tarea_registros` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tarea_id` integer NOT NULL,
	`hecha_en` integer NOT NULL,
	FOREIGN KEY (`tarea_id`) REFERENCES `tareas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_registros_tarea_fecha` ON `tarea_registros` (`tarea_id`,`hecha_en`);--> statement-breakpoint
CREATE TABLE `tareas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo` text NOT NULL,
	`titulo` text NOT NULL,
	`detalle` text,
	`veces` integer,
	`periodo` text,
	`fecha_limite` text,
	`completada_en` integer,
	`creada_en` integer NOT NULL
);
