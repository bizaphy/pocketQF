CREATE TABLE `nota_ediciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nota_id` integer NOT NULL,
	`editor` text NOT NULL,
	`contenido_anterior` text NOT NULL,
	`editada_en` integer NOT NULL,
	FOREIGN KEY (`nota_id`) REFERENCES `notas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_ediciones_nota` ON `nota_ediciones` (`nota_id`);