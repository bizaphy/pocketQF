// Carga como fichas de Pocket QF los suplementos de docs/investigacion-suplementos-chile.json.
// Las fichas que ya existen (mismo principio activo, sin importar mayúsculas) no se tocan.
// Ejecutar con `npm run db:fichas`.

import "dotenv/config";
import { readFileSync } from "node:fs";
import { esquemaFicha } from "@/lib/esquemas";
import { existeFichaConPrincipio, insertarFicha } from "@/lib/fichas";

type SuplementoInforme = {
  nombre: string;
  terminos: string[];
  excluir: string[];
  ficha: {
    indicaciones: string;
    efectosSecundarios: string;
    observaciones: string;
  };
};

const ARCHIVO = "docs/investigacion-suplementos-chile.json";
// queda escrito en la ficha que no la redactó el equipo, para revisarla antes de usarla en atención
const NOTA =
  "Cargada desde la investigación de suplementos del 15-10-2026: revisar antes de usar en atención.";

const informe = JSON.parse(readFileSync(ARCHIVO, "utf-8")) as {
  suplementos: SuplementoInforme[];
};

let creadas = 0;
for (const s of informe.suplementos) {
  const r = esquemaFicha.safeParse({
    principioActivo: s.nombre,
    terminos: [...s.terminos, ...s.excluir.map((t) => `-${t}`)].join(", "),
    indicaciones: s.ficha.indicaciones,
    efectosSecundarios: s.ficha.efectosSecundarios,
    observaciones: `${s.ficha.observaciones}\n\n${NOTA}`,
  });
  if (!r.success) {
    console.error(
      `✗ ${s.nombre}:`,
      r.error.issues.map((i) => i.message),
    );
    continue;
  }
  if (existeFichaConPrincipio(r.data.principioActivo)) {
    console.log(`= ${s.nombre}: ya existe, no se modifica`);
    continue;
  }
  insertarFicha(r.data);
  creadas++;
  console.log(`+ ${s.nombre}`);
}

console.log(`\n${creadas} fichas creadas de ${informe.suplementos.length}`);
