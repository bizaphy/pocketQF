// Consultas de tareas pendientes: periódicas (con sus veces hechas en el periodo actual)
// y fortuitas (pendientes y hechas hace poco).

import { connection } from "next/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  max,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import { tareaRegistros, tareas } from "@/db/schema";
import type { DatosTarea } from "@/lib/esquemas";
import {
  PLANTILLAS_PERIODICAS,
  hechasEnPeriodo,
  inicioPeriodo,
  type Periodo,
} from "@/lib/plantillas-tareas";

export async function obtenerTareasPeriodicas(hoy: Date) {
  await connection();
  const lista = db
    .select()
    .from(tareas)
    .where(eq(tareas.tipo, "periodica"))
    .orderBy(asc(tareas.creadaEn), asc(tareas.id))
    .all();

  // basta con traer lo hecho desde el inicio del periodo más largo
  // (la semana puede empezar en el mes anterior, por eso se toma el menor de los dos)
  const desde = new Date(
    Math.min(
      inicioPeriodo("mes", hoy).getTime(),
      inicioPeriodo("semana", hoy).getTime(),
    ),
  );
  const recientes = db
    .select()
    .from(tareaRegistros)
    .where(gte(tareaRegistros.hechaEn, desde))
    .all();

  const ultimas = db
    .select({
      tareaId: tareaRegistros.tareaId,
      ultima: max(tareaRegistros.hechaEn),
    })
    .from(tareaRegistros)
    .groupBy(tareaRegistros.tareaId)
    .all();

  return lista.map((t) => {
    const periodo = t.periodo as Periodo;
    const veces = t.veces ?? 1;
    const hechas = hechasEnPeriodo(
      recientes.filter((r) => r.tareaId === t.id).map((r) => r.hechaEn),
      periodo,
      hoy,
    );
    const ultima = ultimas.find((u) => u.tareaId === t.id)?.ultima;
    return {
      id: t.id,
      titulo: t.titulo,
      detalle: t.detalle,
      veces,
      periodo,
      hechas,
      completa: hechas >= veces,
      ultimaVez: ultima ?? null, // Drizzle ya lo convierte a Date (mode: "timestamp")
    };
  });
}

export async function obtenerTareasFortuitas() {
  await connection();
  const pendientes = db
    .select()
    .from(tareas)
    .where(and(eq(tareas.tipo, "fortuita"), isNull(tareas.completadaEn)))
    // primero las que tienen fecha límite (la más cercana arriba), después el resto
    .orderBy(
      sql`${tareas.fechaLimite} is null`,
      asc(tareas.fechaLimite),
      asc(tareas.creadaEn),
    )
    .all();
  const hechas = db
    .select()
    .from(tareas)
    .where(and(eq(tareas.tipo, "fortuita"), isNotNull(tareas.completadaEn)))
    .orderBy(desc(tareas.completadaEn))
    .limit(10)
    .all();
  return { pendientes, hechas };
}

// para la alerta del inicio: solo cuentan las fortuitas sin completar (las periódicas no avisan)
export async function contarFortuitasPendientes() {
  await connection();
  const fila = db
    .select({ n: count() })
    .from(tareas)
    .where(and(eq(tareas.tipo, "fortuita"), isNull(tareas.completadaEn)))
    .get();
  return fila?.n ?? 0;
}

export function insertarTarea(datos: DatosTarea) {
  return db.insert(tareas).values(datos).returning().get();
}

export function eliminarTarea(id: number) {
  // borra en cascada sus registros (FK con onDelete: "cascade")
  return db.delete(tareas).where(eq(tareas.id, id)).returning().get();
}

// periódica: suma una vez hecha. fortuita: queda completada
export function marcarHecha(id: number) {
  const tarea = db.select().from(tareas).where(eq(tareas.id, id)).get();
  if (!tarea) return undefined;
  if (tarea.tipo === "periodica") {
    db.insert(tareaRegistros).values({ tareaId: id }).run();
  } else {
    db.update(tareas)
      .set({ completadaEn: new Date() })
      .where(eq(tareas.id, id))
      .run();
  }
  return tarea;
}

// periódica: quita la última vez hecha en el periodo actual. fortuita: vuelve a pendiente
export function deshacerHecha(id: number, hoy: Date) {
  const tarea = db.select().from(tareas).where(eq(tareas.id, id)).get();
  if (!tarea) return undefined;
  if (tarea.tipo === "fortuita") {
    db.update(tareas)
      .set({ completadaEn: null })
      .where(eq(tareas.id, id))
      .run();
    return tarea;
  }

  const desde = inicioPeriodo(tarea.periodo as Periodo, hoy);
  const ultimo = db
    .select({ id: tareaRegistros.id })
    .from(tareaRegistros)
    .where(
      and(eq(tareaRegistros.tareaId, id), gte(tareaRegistros.hechaEn, desde)),
    )
    .orderBy(desc(tareaRegistros.hechaEn), desc(tareaRegistros.id))
    .get();
  if (!ultimo) return undefined;
  db.delete(tareaRegistros).where(eq(tareaRegistros.id, ultimo.id)).run();
  return tarea;
}

// tareas de ejemplo para partir: las primeras 4 plantillas periódicas
export function insertarTareasEjemplo() {
  return db
    .insert(tareas)
    .values(
      PLANTILLAS_PERIODICAS.slice(0, 4).map((p) => ({
        tipo: "periodica" as const,
        ...p,
      })),
    )
    .returning()
    .all();
}
