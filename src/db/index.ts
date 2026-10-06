// Conexión única a SQLite: abre data/vencimientos.db,
// la configura y exporta `db` (Drizzle) para toda la app
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database(process.env.DATABASE_URL!); //ABRE EL ARCHIVO DE LA BDD y guarda la conex.

sqlite.pragma("journal_mode = WAL"); // leer mientras otro proceso escribe
sqlite.pragma("foreign_keys = ON"); // respetar las FK

export const db = drizzle(sqlite, { schema });
