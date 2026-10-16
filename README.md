# PocketQF

Herramientas internas para una farmacia: control de **vencimientos**, **tareas** del equipo,
**inventario** del día, **mapa de ubicaciones**, consulta rápida de medicamentos (**Pocket QF**)
y una **nota del día** para comunicar avisos. La base de productos se actualiza cada semana
subiendo el Excel que exporta el sistema POS.

Está pensada para usarse en la red local de la farmacia, desde el computador del mesón o un
teléfono. No tiene usuarios ni contraseñas: quien abre la página puede usar todo.

---

## Índice

1. [Módulos](#módulos)
2. [Stack](#stack)
3. [Puesta en marcha](#puesta-en-marcha)
4. [Scripts](#scripts)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Base de datos](#base-de-datos)
7. [El Excel semanal de productos](#el-excel-semanal-de-productos)
8. [Cómo funciona cada módulo](#cómo-funciona-cada-módulo)
9. [Convenciones del código](#convenciones-del-código)
10. [Tests](#tests)
11. [Agregar un módulo nuevo](#agregar-un-módulo-nuevo)
12. [Datos sensibles](#datos-sensibles)
13. [Limitaciones conocidas](#limitaciones-conocidas)

---

## Módulos

| Ruta                    | Módulo            | Para qué sirve                                                                                       |
| ----------------------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| `/`                     | Inicio            | Tarjetas de cada módulo y el post-it con la **nota del día** (editable, con historial).              |
| `/vencimientos`         | Vencimientos      | Lotes ordenados por fecha de vencimiento, con semáforo de urgencia y contador por plazo.             |
| `/vencimientos/nuevo`   | Nuevo vencimiento | Registrar un lote: producto, lote, fecha y cantidad.                                                 |
| `/tareas`               | Tareas pendientes | Tareas periódicas (ej: 2 veces por semana) y fortuitas (una sola vez), con lista predefinida.        |
| `/productos`            | Productos         | Subir el Excel semanal y ver cuántos productos hay por categoría.                                    |
| `/productos/guia-excel` | Guía del Excel    | Qué columnas debe traer el Excel y cómo se valida.                                                   |
| `/inventario`           | Inventario        | Generar una lista de productos para contar (al azar o por categoría) y calendario de inventarios.    |
| `/inventario/[id]`      | Conteo            | Registrar lo contado de cada producto y ver las diferencias con el sistema.                          |
| `/ubicaciones`          | Ubicaciones       | Mapa de cada zona de la farmacia con sus muebles, editable arrastrando.                              |
| `/ubicaciones/[id]`     | Mueble            | Repisas de un mueble y lo que guarda cada una.                                                       |
| `/pocket-qf`            | Pocket QF         | Buscar un producto y ver su uso típico, efectos secundarios y precauciones; buscar por uso o efecto. |
| `/pocket-qf/[id]`       | Ficha             | Editar la ficha de un principio activo y sus productos asociados.                                    |

La barra lateral tiene enlaces externos de consulta: Registro ISP, Noticias ISP, el calendario
semestral de farmacias de turno de la Región Metropolitana (ISP) y el calendario
de feriados de Chile.

---

## Stack

| Herramienta                                                           | Uso                                                                                                                                                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Next.js 16](https://nextjs.org) (App Router)                         | Páginas como componentes de servidor y **Server Actions** para guardar datos. Esta versión tiene cambios respecto a versiones anteriores: ver `AGENTS.md` y `node_modules/next/dist/docs/`. |
| React 19                                                              | `useActionState` y `useTransition` en los formularios.                                                                                                                                      |
| TypeScript                                                            | Todo el código.                                                                                                                                                                             |
| SQLite + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Base de datos en un solo archivo (`data/vencimientos.db`). Las consultas son síncronas.                                                                                                     |
| [Drizzle ORM](https://orm.drizzle.team) + drizzle-kit                 | Esquema en TypeScript, consultas y migraciones.                                                                                                                                             |
| [Zod 4](https://zod.dev)                                              | Validación de todo lo que llega desde los formularios.                                                                                                                                      |
| [Tailwind CSS 4](https://tailwindcss.com)                             | Estilos. La paleta está en `src/app/globals.css`.                                                                                                                                           |
| [date-fns](https://date-fns.org)                                      | Fechas, periodos y formato en español.                                                                                                                                                      |
| [ExcelJS](https://github.com/exceljs/exceljs)                         | Leer el Excel semanal de productos.                                                                                                                                                         |
| [Sonner](https://sonner.emilkowal.ski)                                | Avisos (toasts), abajo al centro.                                                                                                                                                           |
| [Vitest](https://vitest.dev)                                          | Tests de la lógica pura.                                                                                                                                                                    |

---

## Puesta en marcha

Requisitos: **Node.js** (se desarrolla con la versión 22). better-sqlite3 descarga o compila un módulo nativo al instalar.

```bash
# 1. dependencias
npm install

# 2. variables de entorno: ruta del archivo de la base de datos
echo DATABASE_URL=./data/vencimientos.db > .env

# 3. crear la carpeta de datos y las tablas
mkdir data
npm run db:migrate

# 4. servidor de desarrollo
npm run dev
```

Abre <http://localhost:3000>. Después, en **Productos**, sube el Excel del POS para cargar la
base de productos (hay un Excel de ejemplo descargable en esa misma página).

### Variables de entorno

| Variable       | Ejemplo                  | Descripción                                                                                      |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------------ |
| `DATABASE_URL` | `./data/vencimientos.db` | Ruta del archivo SQLite. La usan la app (`src/db/index.ts`) y drizzle-kit (`drizzle.config.ts`). |

---

## Scripts

| Comando               | Qué hace                                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo con recarga automática.                                                                                                                                     |
| `npm run build`       | Compila para producción.                                                                                                                                                           |
| `npm run start`       | Sirve la versión compilada.                                                                                                                                                        |
| `npm run lint`        | ESLint.                                                                                                                                                                            |
| `npm test`            | Vitest en modo observador. `npx vitest run` los corre una vez.                                                                                                                     |
| `npm run db:generate` | Genera una migración nueva en `drizzle/` a partir de los cambios en `src/db/schema.ts`.                                                                                            |
| `npm run db:migrate`  | Aplica las migraciones pendientes a la base.                                                                                                                                       |
| `npm run db:studio`   | Abre Drizzle Studio para ver y editar las tablas en el navegador.                                                                                                                  |
| `npm run db:seed`     | Carga 3 productos y 4 lotes de prueba. **Vacía las tablas de productos y vencimientos**: úsalo solo en una base nueva (falla si hay inventarios o fichas que apuntan a productos). |
| `npm run db:fichas`   | Carga como fichas de Pocket QF los suplementos de `docs/investigacion-suplementos-chile.json`. Las fichas que ya existen no se modifican, así que se puede correr más de una vez.  |

---

## Estructura del proyecto

```
├── data/                    base SQLite (ignorada por git)
├── drizzle/                 migraciones SQL generadas por drizzle-kit (sí se suben)
├── public/                  imágenes, íconos y el Excel de ejemplo
├── scripts/seed.ts          datos de prueba
└── src/
    ├── app/                 rutas (una carpeta por página) y layout general
    ├── actions/             Server Actions: validan con zod, guardan y refrescan la página
    ├── components/          componentes de React (de servidor y de cliente)
    ├── db/
    │   ├── schema.ts        tablas, columnas, índices y relaciones
    │   └── index.ts         conexión única a SQLite (WAL y claves foráneas activadas)
    └── lib/                 lógica: consultas a la base y funciones puras con sus tests
```

### Las tres capas

Cada módulo sigue el mismo recorrido:

```
página (app/…/page.tsx)          lee datos con funciones de lib/ y los dibuja
   │
   ├─ componente de cliente      formulario o botón ("use client")
   │       │ llama a
   │       ▼
   │  acción (actions/…)         valida con zod (lib/esquemas.ts), revisa reglas,
   │       │                      guarda y llama a revalidatePath()
   │       ▼
   └─ lib/ (consultas)           habla con la base usando Drizzle
          lib/ (lógica pura)     cálculos sin base de datos: fechas, cruces, reglas → con tests
```

| Módulo       | Página                                   | Acciones                  | Consultas            | Lógica pura (con tests)                                  |
| ------------ | ---------------------------------------- | ------------------------- | -------------------- | -------------------------------------------------------- |
| Vencimientos | `app/vencimientos/`                      | `actions/vencimientos.ts` | `lib/consultas.ts`   | `fechas`, `urgencia`, `umbrales`, `resumen-vencimientos` |
| Nota del día | `app/page.tsx`, `components/post-it.tsx` | `actions/notas.ts`        | `lib/consultas.ts`   | —                                                        |
| Tareas       | `app/tareas/`                            | `actions/tareas.ts`       | `lib/tareas.ts`      | `plantillas-tareas`                                      |
| Productos    | `app/productos/`                         | `actions/productos.ts`    | `lib/consultas.ts`   | `importar-productos`                                     |
| Inventario   | `app/inventario/`                        | `actions/inventario.ts`   | `lib/inventario.ts`  | `calendario`                                             |
| Ubicaciones  | `app/ubicaciones/`                       | `actions/ubicaciones.ts`  | `lib/ubicaciones.ts` | `mapa`                                                   |
| Pocket QF    | `app/pocket-qf/`                         | `actions/pocket-qf.ts`    | `lib/fichas.ts`      | `pocket-qf`                                              |

---

## Base de datos

SQLite en `data/vencimientos.db`. Las fechas con hora se guardan como _timestamp_ (segundos) y
Drizzle las convierte a `Date`; las fechas sin hora (vencimiento, fecha límite) se guardan como
texto `"YYYY-MM-DD"`, que se puede ordenar y comparar directamente.

```
productos ─┬─< vencimientos
           ├─< inventario_items >── inventarios
           └─< ficha_productos  >── fichas

notas ─< nota_ediciones          tareas ─< tarea_registros

zonas ─< estantes ─< repisas     importaciones (registro de cada Excel subido)
```

| Tabla              | Qué guarda                                                                                        | Detalles                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `productos`        | Cada producto del Excel: código de barra (`sku`), nombre, stock, categoría.                       | `activo = false` cuando deja de venir en el Excel; no se borra porque puede tener vencimientos o conteos. |
| `importaciones`    | Un registro por cada Excel subido.                                                                | Totales de nuevos, actualizados y desactivados.                                                           |
| `vencimientos`     | Lotes: producto, lote, fecha de vencimiento y cantidad.                                           | `ultima_revision` se actualiza sola al editar.                                                            |
| `notas`            | Notas del post-it: contenido, autor y fecha.                                                      | La "nota del día" es la más reciente escrita hoy.                                                         |
| `nota_ediciones`   | Cada edición de una nota: quién, cuándo y **cómo decía antes**.                                   | Se borra en cascada con la nota.                                                                          |
| `tareas`           | Tareas `periodica` (con `veces` y `periodo`) o `fortuita` (con `fecha_limite` y `completada_en`). | Las columnas de un tipo quedan en `null` en el otro.                                                      |
| `tarea_registros`  | Cada vez que se hizo una tarea periódica.                                                         | El avance del periodo se calcula contando registros.                                                      |
| `inventarios`      | Una lista de productos para contar (al azar o por categoría).                                     | `finalizado_en = null` mientras se cuenta.                                                                |
| `inventario_items` | Cada producto del inventario: stock del sistema y lo contado.                                     | `contado_en` evita repetir productos contados hace poco.                                                  |
| `zonas`            | Zonas de la farmacia (sala de ventas, bodega…).                                                   | Nombre único.                                                                                             |
| `estantes`         | Muebles del mapa: tipo, posición y tamaño en celdas.                                              | Tipos: estante, vitrina, refrigerador, mesón.                                                             |
| `repisas`          | Repisas de un mueble y lo que guardan.                                                            | Número único dentro de cada mueble.                                                                       |
| `fichas`           | Ficha de un principio activo: otros nombres, uso típico, efectos secundarios y precauciones.      | Principio activo único (sin distinguir mayúsculas).                                                       |
| `ficha_productos`  | Productos asociados **a mano** a una ficha.                                                       | Solo las excepciones; el resto se asocia por nombre (ver Pocket QF).                                      |

### Cambiar el esquema

1. Edita `src/db/schema.ts`.
2. `npm run db:generate` crea el archivo SQL en `drizzle/` (revísalo).
3. `npm run db:migrate` lo aplica a tu base.
4. Sube al repositorio el SQL nuevo, `drizzle/meta/_journal.json` y el snapshot.

> La base usa modo WAL: los últimos cambios pueden estar en `vencimientos.db-wal` hasta que
> SQLite los traspase al archivo principal. Para copiar la base, copia los tres archivos
> (`.db`, `.db-wal` y `.db-shm`) o detén la app antes.

---

## El Excel semanal de productos

Se sube en **Productos**. Las columnas se reconocen por su **encabezado** (fila 1), sin importar
el orden, las mayúsculas ni las tildes:

| Columna          | Regla del encabezado                                     | Uso                                                                 |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| Código de Barras | empieza con "código de barra"                            | Identifica al producto (`sku`).                                     |
| Nombre           | exactamente "Nombre"                                     | Nombre que se muestra y en el que se buscan los principios activos. |
| Stock            | empieza con "stock" (ej: "Stock en Farmacias Patagonia") | Stock actual.                                                       |
| Categoría        | empieza con "categoría"                                  | Agrupación en inventario, vencimientos y productos.                 |

Las demás columnas (Coste, Precio, SKU…) **se ignoran y no se guardan**.

Al importar, todo pasa en una sola transacción:

1. Si hay **cualquier error** en el archivo, no se guarda nada y se muestran las filas con problemas.
2. Los productos del Excel se crean o se actualizan (por código de barra) y quedan activos.
3. Los que ya no vienen se marcan como inactivos.
4. Se guarda un registro en `importaciones`.

La guía completa para el equipo está en `/productos/guia-excel`.

---

## Cómo funciona cada módulo

### Inicio y nota del día

- Las tarjetas salen de `src/lib/modulos.ts`. Las de módulos con `activo: false` se muestran en
  gris como "Próximamente". La de Pocket QF tiene `destacado: true`: ocupa todo el ancho y va en
  verde oscuro con texto blanco.
- **Nota del día**: la nota más reciente, siempre que se haya escrito hoy. Las anteriores pasan
  al historial lateral.
- **Editar**: solo la nota de hoy (lo valida el servidor). Se pide quién edita; el autor
  original se mantiene y se muestra "Editada por X". En **Ver cambios** aparecen todas las
  ediciones con la versión anterior de cada una. Si el texto no cambió, no se guarda.

### Vencimientos

- Tabla ordenada por fecha, del más próximo al más lejano. "Nombres completos" cambia entre la
  vista compacta y la extendida (`?vista=extendida`).
- **Semáforo** (`lib/urgencia.ts`, umbrales en `lib/umbrales.ts`):

  | Días restantes | Color       |
  | -------------- | ----------- |
  | vencido        | rojo fuerte |
  | hasta 30       | rojo suave  |
  | hasta 90       | amarillo    |
  | más de 90      | azul suave  |

- **Contador por plazo** (`lib/resumen-vencimientos.ts`): lotes que vencen dentro de 1, 3, 6 y 12
  meses (acumulados) y los ya vencidos aparte, con las categorías más afectadas de cada plazo.
- Cada lote se puede editar (lote, fecha, cantidad) o eliminar con confirmación.

### Tareas pendientes

- **Periódicas**: tienen frecuencia (`veces` por `dia`, `semana` o `mes`). Cada **✓** guarda un
  registro; el avance se muestra como "1/2 esta semana" y vuelve a 0 al empezar un periodo nuevo.
  Las semanas parten el **lunes**. "Deshacer" quita el último registro del periodo actual.
  Las pendientes aparecen primero.
- **Fortuitas**: se hacen una vez. Tienen detalle (proveedor, cliente, producto) y fecha límite
  opcionales; la fecha usa el mismo semáforo que vencimientos ("Para hoy", "Atrasada 2 días").
  Al marcarlas pasan a "Hechas recientemente" (las últimas 10) y se pueden reabrir.
- **Lista predefinida** (`lib/plantillas-tareas.ts`): 15 periódicas con su frecuencia típica y 12
  fortuitas genéricas con un ejemplo de detalle. Elegir una completa el formulario y se puede
  ajustar. Para cambiar la lista, edita ese archivo.
- Si no hay periódicas, un botón carga 4 de ejemplo.

### Productos

- Subir el Excel (ver [arriba](#el-excel-semanal-de-productos)) y ver la última importación.
- Conteo de productos activos por categoría, con o sin los de stock 0 (`?sinStock=1`).

### Inventario

- **Generar**: al azar o de una categoría, con cantidad de productos, días sin repetir productos
  ya contados e incluir o no los de stock 0. El stock del sistema se guarda en ese momento.
- **Contar**: se anota lo contado de cada producto; al finalizar se muestran las diferencias.
  Un producto cuenta como inventariado cuando se registra su conteo, no al salir en una lista.
- **Calendario**: marca los días con inventario. Un inventario ese día lleva directo a él; varios
  filtran la tabla (`?mes=2026-10&dia=2026-10-14`).

### Ubicaciones

- Cada **zona** tiene un mapa de 30 × 18 celdas.
- En modo **editar** se agregan muebles (estante, vitrina, refrigerador, mesón), se arrastran, se
  les cambia el tamaño desde la esquina y se rotan. Se guardan al soltar; si chocan con otro
  mueble o se salen del mapa, el servidor los rechaza y vuelven a su lugar (`lib/mapa.ts`).
- En modo **ver**, tocar un mueble abre sus repisas. Cada repisa muestra su ubicación completa,
  por ejemplo "SALA DE VENTAS - Estante 1 (sala), Repisa 2" → "Oftálmicos".

### Pocket QF

El POS no trae el principio activo en una columna aparte, pero casi siempre viene dentro del
nombre (`CELTIUM ESCITALOPRAM 20MG 30 COMP REC SAVAL`). Por eso la información se guarda **por
principio activo**, no por producto:

- Una **ficha** (ej: "Escitalopram") se asocia sola a todos los productos cuyo nombre contiene el
  principio activo o alguno de sus **otros nombres** (ej: "hiocina" para hioscina). La
  comparación ignora tildes y mayúsculas y solo cuenta **palabras completas** ("sal" no coincide
  con "salbutamol"). Los términos de menos de 3 letras se ignoran.
- Un término con **guion adelante excluye**: `zinc, -oxido de zinc, -shampoo` asocia los
  comprimidos de zinc, pero no las pomadas de óxido de zinc ni el champú.
- Las marcas cuyo nombre no trae el principio activo se **asocian a mano** desde la ficha
  (`ficha_productos`). Esa asociación se mantiene con cada Excel nuevo.
- Un producto combinado (ej: paracetamol con cafeína) muestra las dos fichas.
- La idea es crear fichas solo para los medicamentos que necesiten aclaración, no para todos.
- **Fichas de suplementos**: `npm run db:fichas` carga 23 fichas (vitamina D, magnesio, selenio,
  creatina, ashwagandha, ajo negro, aceite de orégano…) desde una investigación con fuentes en
  `docs/investigacion-suplementos-chile.json`, que incluye además los límites legales chilenos para
  suplementos (Res. 394/2002). Cada ficha cargada así lo indica al final y debe revisarse antes de
  usarla en atención.

En la página:

- **Consulta rápida**: buscar por nombre, código de barra o principio activo. Cada resultado
  indica sus fichas o "Sin ficha"; al elegirlo se ve su uso típico, efectos secundarios y
  precauciones.
- **Buscar por uso o efecto**: busca en el texto de las fichas. Ej: "dejar de fumar" encuentra
  la ficha de anfebutamona si su uso típico lo menciona. Ignora tildes, mayúsculas, orden y
  palabras de relleno ("para", "de"); con varias palabras, la ficha debe tenerlas todas. Muestra
  solo los campos donde aparece lo buscado, resaltado, y los productos de la ficha con su stock.
  Solo encuentra lo que el equipo escribió.
- **Fichas**: lista con cuántos productos tiene cada una y la marca "Sin completar" si no tiene
  información.

La lógica del cruce está en `src/lib/pocket-qf.ts` y es pura (con tests), así se puede probar
sin base de datos.

---

## Convenciones del código

- **Idioma**: nombres de variables, funciones, archivos y comentarios en **español**
  (`obtenerTareas`, `formulario-ficha.tsx`). Los textos de la interfaz, en español neutro.
- **Páginas**: componentes de servidor `async` que leen con funciones de `lib/`. Las consultas
  llaman a `await connection()` para que la página se genere en cada visita (SQLite es síncrono
  y Next no detectaría solo que el dato es dinámico).
- **Formularios**: componente `"use client"` con `useActionState`; la acción devuelve
  `{ ok, mensaje, errores? }` y el componente muestra un toast y los errores por campo.
- **Acciones que no son formularios** (marcar hecha, eliminar): reciben el id con
  `accion.bind(null, id)` y devuelven `{ ok, mensaje }`. Los botones genéricos son
  `components/boton-accion.tsx` (sin confirmación) y `components/boton-confirmar.tsx` (con
  pop-up). Ambos aceptan una versión de solo ícono (✓ y X).
- **Validación**: todo lo que llega del navegador pasa por un esquema de `lib/esquemas.ts`, y
  las reglas de negocio (choques en el mapa, "solo la nota de hoy") se vuelven a revisar en el
  servidor.
- **Después de guardar**: `revalidatePath()` de las rutas que muestran ese dato.
- **Estilos**: clases de Tailwind escritas completas (Tailwind no detecta clases armadas con
  variables). Colores de la paleta en `globals.css`; cada módulo tiene su color de acento en
  `lib/modulos.ts`. Los campos de formulario usan la clase `input`.
- **Formato**: Prettier (configuración por defecto).

### Paleta

| Token         | Color     | Uso                                                |
| ------------- | --------- | -------------------------------------------------- |
| `deep-space`  | `#1d3557` | Texto principal, encabezados, botones principales  |
| `steel`       | `#457b9d` | Texto secundario                                   |
| `frosted`     | `#a8dadc` | Bordes y acentos suaves                            |
| `honeydew`    | `#f1faee` | Fondo de la página                                 |
| `strawberry`  | `#e63946` | Vencido, urgente, eliminar; acento de Vencimientos |
| `saffron`     | `#ffb703` | Advertencia; acento de Inventario                  |
| `sage`        | `#2a9d8f` | Acento de Tareas; fondo del inicio (al 25 %)       |
| `sage-oscuro` | `#1b675e` | Tarjeta destacada del inicio                       |
| `moss`        | `#6a994e` | Acento de Ubicaciones                              |
| `lavender`    | `#7b6cb5` | Acento de Pocket QF                                |

---

## Tests

```bash
npx vitest run        # una vez
npm test              # modo observador
```

Se prueba la **lógica pura** de `src/lib/` (archivos `*.test.ts` junto a cada archivo):

| Archivo                        | Qué cubre                                                          |
| ------------------------------ | ------------------------------------------------------------------ |
| `fechas.test.ts`               | Días restantes y formatos de fecha.                                |
| `urgencia.test.ts`             | Colores y textos del semáforo.                                     |
| `resumen-vencimientos.test.ts` | Contador por plazo y categorías afectadas.                         |
| `esquemas.test.ts`             | Validaciones de zod.                                               |
| `importar-productos.test.ts`   | Lectura y validación del Excel.                                    |
| `calendario.test.ts`           | Grilla del mes del calendario de inventarios.                      |
| `mapa.test.ts`                 | Bordes, choques y huecos libres del mapa; texto de cada ubicación. |
| `plantillas-tareas.test.ts`    | Frecuencias, inicio de cada periodo, avance y plazos de tareas.    |
| `pocket-qf.test.ts`            | Cruce fichas ↔ productos, búsqueda por uso o efecto y resaltado.   |

Las funciones que dependen de la fecha reciben `hoy` como parámetro, así los tests usan una
fecha fija.

---

## Agregar un módulo nuevo

1. **Tablas**: agrégalas en `src/db/schema.ts`, luego `npm run db:generate` y `npm run db:migrate`.
2. **Validación**: esquema zod en `src/lib/esquemas.ts`.
3. **Consultas**: `src/lib/<modulo>.ts` (con `await connection()` en las que leen para una página).
4. **Lógica pura**: en un archivo aparte de `src/lib/` con su `*.test.ts`.
5. **Acciones**: `src/actions/<modulo>.ts` con `"use server"`, validando y llamando a
   `revalidatePath()`.
6. **Página**: `src/app/<ruta>/page.tsx`, con `EncabezadoModulo` y `metadata.title`.
7. **Menú e inicio**: agrega el módulo a `src/lib/modulos.ts` con su ícono y color de acento
   (`activo: true` para que aparezca en el menú). Si el color es nuevo, agrégalo a `globals.css`.

---

## Datos sensibles

- `data/` (la base) y `src/data/` (exports reales del POS) están en `.gitignore`. El export del POS
  trae **costes, precios y stock** de la farmacia: no lo subas al repositorio. Para ejemplos usa
  `public/productos-ejemplo.xlsx`, que tiene datos de muestra.
- La app solo guarda de los productos el código de barra, el nombre, el stock y la categoría.

---

## Limitaciones conocidas

- **Sin autenticación**: cualquiera con acceso a la página puede crear, editar y eliminar. Los
  nombres ("autor", "quién edita") se escriben a mano y no se verifican.
- **Un solo servidor**: SQLite es un archivo local; no está pensada para varias instancias.
- **Pocket QF depende del nombre**: si el POS escribe el principio activo de forma distinta, hay
  que agregarlo en "otros nombres" o asociar el producto a mano. La información de las fichas la
  escribe el equipo y **no reemplaza el folleto del producto ni la indicación médica**.
- **Hora del servidor**: "hoy", las semanas y los meses se calculan con la zona horaria del
  computador donde corre la app.
