# Mis Workouts — Contexto

Mis Workouts permite armar **un** circuito de ejercicios por tiempo: eliges
ejercicios, defines segundos de trabajo, segundos de descanso y número de
vueltas, y lo reproduces con un temporizador. También ofrece circuitos
sugeridos de calistenia, cada uno con su calentamiento, que se pueden elegir
como punto de partida.

Los ejercicios vienen del dataset
[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)
(ver `docs/fuente.html`). Las instrucciones están en español; nombres, partes
del cuerpo, equipo y músculos vienen solo en inglés y se traducen con un
diccionario.

---

## 1. Glosario

Usar estos nombres tal cual en pantalla y en el código.

| Término | En código | Definición |
|---|---|---|
| Ejercicio | `ejercicio` | Una ficha del dataset (nombre, parte del cuerpo, equipo, músculo protagonista, instrucciones, animación), identificada por su `id` de 4 dígitos. |
| Circuito | `circuito` | La lista ordenada de estaciones más su configuración de trabajo, descanso y vueltas; la app guarda uno solo. |
| Estación | `estacion` | Un ejercicio colocado en una posición del circuito; el mismo ejercicio puede aparecer en dos estaciones. |
| Vuelta | `vuelta` | Una pasada completa por todas las estaciones, de la primera a la última (también se le llama *bloque*). |
| Trabajo | `trabajo` | Segundos que se hace el ejercicio en cada estación; igual para todas. |
| Descanso | `descanso` | Segundos de pausa después de cada estación, excepto después de la última estación de la última vuelta. |
| Fase | `fase` | El tramo que corre el temporizador en este momento: `trabajo` o `descanso`. |
| Calentamiento | `calentamiento` | Lista corta de ejercicios con sus segundos que se hace una sola vez, sin descansos, antes de la primera vuelta. Es opcional. |
| Circuito sugerido | `circuitoSugerido` | Un circuito ya armado por la app (ejercicios, trabajo, descanso, vueltas y calentamiento) que la persona puede elegir como su circuito. Están en `lib/circuitos.ts`. |
| Duración total | `duracionTotal` | Tiempo de principio a fin: calentamiento + `vueltas × estaciones × trabajo + (vueltas × estaciones − 1) × descanso`. |
| Distribución muscular | `distribucionMuscular` | Resumen por músculo protagonista (`target`): cuántas veces aparece por vuelta y cuántos segundos de trabajo recibe por vuelta y en total. |

---

## 2. Casos de uso

### 2.1 Explorar

- **Buscar** ejercicios por texto. Busca en el nombre (en inglés), en un
  diccionario de equivalentes en español (`lib/busqueda.ts`) y en las etiquetas
  traducidas, para que “sentadilla” encuentre *squat*. No busca en las
  instrucciones: se piden solo al abrir el detalle, para que la página cargue
  ~200 KB en vez de ~1 MB.
- **Filtrar** por parte del cuerpo (10 opciones) y por equipo. Los filtros se
  combinan entre sí y con la búsqueda.
- **Ver detalle** de un ejercicio: nombre, parte del cuerpo, equipo, músculo
  protagonista y secundarios, pasos en español y animación con su crédito
  “© Gym visual”.
- Desde la lista o el detalle, **agregar** el ejercicio a Mi circuito.

### 2.2 Circuitos

Circuitos sugeridos de calistenia (solo peso corporal), en la ruta `/circuitos`.

- **Filtrar** por para quién: Todos, Para mujeres, Para hombres. Los
  circuitos “Para todos” aparecen en los tres filtros.
- **Elegir** un circuito y ver: descripción, nivel, duración del
  calentamiento, del circuito y total; trabajo, descanso y vueltas; el
  calentamiento y las estaciones en orden; y la distribución muscular.
- **Ver detalle** de cualquier ejercicio del calentamiento o del circuito
  (el mismo detalle que en Explorar).
- **Usar este circuito**: lo guarda como el circuito de la persona
  (reemplaza el que tuviera), incluido su calentamiento.

| Circuito | Para | Nivel | Trabajo / descanso × vueltas | Calentamiento | Total |
|---|---|---|---|---|---|
| Quema grasa | Hombres | Intermedio | 40 / 20 × 3, 8 estaciones | General (4:15) | 27:55 |
| Quema grasa | Mujeres | Intermedio | 40 / 20 × 3, 8 estaciones | General (4:15) | 27:55 |
| Abdomen plano | Mujeres | Todos los niveles | 30 / 15 × 3, 7 estaciones | Suave y de core (4:00) | 19:30 |
| Principiante en casa | Todos | Principiante | 30 / 30 × 2, 6 estaciones | Suave y de core (4:00) | 15:30 |
| HIIT exprés | Todos | Avanzado | 20 / 10 × 4, 4 estaciones | General (4:15) | 12:05 |
| Piernas y glúteos | Todos | Intermedio | 45 / 15 × 3, 7 estaciones | General (4:15) | 25:00 |

“Para hombres” y “Para mujeres” cambian el énfasis (tren superior vs. piernas
y glúteos); cualquiera puede usar cualquier circuito. Abdomen plano avisa en
pantalla que la grasa no se pierde por zonas y que conviene combinarlo con un
circuito de quema grasa.

### 2.3 Mi circuito

- **Agregar** un ejercicio como nueva estación al final.
- **Quitar** una estación.
- **Reordenar** estaciones (subir/bajar o arrastrar).
- **Configurar** trabajo (s), descanso (s) y vueltas. Valores iniciales:
  40 s, 20 s, 3 vueltas.
- **Ver duración total**, que se recalcula con cada cambio.
- **Ver distribución muscular**: por cada músculo protagonista, cuántas veces
  se trabaja por vuelta, cuántos segundos por vuelta y cuántos en total.
  Se calcula; no se guarda.

Ejemplo con 5 estaciones, 40 s de trabajo, 20 s de descanso, 3 vueltas:

| Músculo protagonista | Veces por vuelta | Trabajo por vuelta | Veces en total | Trabajo total |
|---|---|---|---|---|
| Abdominales (`abs`) | 2 | 80 s | 6 | 4:00 |
| Glúteos (`glutes`) | 1 | 40 s | 3 | 2:00 |
| Pectorales (`pectorals`) | 1 | 40 s | 3 | 2:00 |
| Dorsales (`lats`) | 1 | 40 s | 3 | 2:00 |
| **Total** | **5** | **200 s** | **15** | **10:00** |

Duración total: 15 × 40 s + 14 × 20 s = 600 + 280 = **880 s = 14:40**.

### 2.4 Entrenar

- **Reproducir** el circuito: si tiene calentamiento, primero lo recorre
  ejercicio por ejercicio sin descansos; luego el temporizador recorre
  trabajo → descanso → siguiente estación, vuelta tras vuelta.
- **Pausar** y reanudar sin perder el segundo en que iba.
- **Saltar** a la siguiente fase (de trabajo a descanso, o de descanso a la
  siguiente estación).
- **Ver** la vuelta actual (“Vuelta 2 de 3”), la estación actual
  (“Estación 4 de 5”), la fase, los segundos que faltan y el ejercicio que
  sigue.
- **Ver el circuito** mientras entrena: las vueltas hechas, la actual y las
  que faltan; las estaciones de la vuelta actual marcadas como hechas, la
  actual y las pendientes; y el tiempo que queda.
- Solo se puede entrenar si el circuito tiene al menos una estación.

---

## 3. Estrategia de guardado

**Un solo circuito en `localStorage`** bajo la clave `mis-workouts:circuito`.
Se guardan solo los IDs de los ejercicios (en orden) y la configuración;
nombres, instrucciones y músculos se buscan en el dataset al cargar.

```json
{
  "version": 1,
  "ejercicios": ["0043", "0025", "0652", "0001", "0002"],
  "trabajo": 40,
  "descanso": 20,
  "vueltas": 3,
  "calentamiento": [
    { "ejercicio": "0685", "segundos": 45 },
    { "ejercicio": "3224", "segundos": 30 }
  ]
}
```

- El orden del arreglo `ejercicios` es el orden de las estaciones.
- Un ID repetido son dos estaciones con el mismo ejercicio.
- `calentamiento` es opcional; si falta, se entrena sin calentamiento. Sigue
  siendo `version: 1` porque lo guardado antes sigue siendo válido.
- Duración total y distribución muscular **no** se guardan: se calculan.
- `version` permite cambiar la forma más adelante sin romper lo guardado.

### Si está vacío o dañado

- **No existe la clave** (primera visita): circuito sin estaciones con
  40 / 20 / 3. Mi circuito muestra “Tu circuito está vacío” con un enlace a
  Explorar; Entrenar está desactivado.
- **El contenido no se puede leer** (JSON roto o forma distinta): se trata
  igual que vacío y se sobrescribe al siguiente cambio.
- **Un ID ya no existe en el dataset**: se ignora esa estación y se avisa
  “1 ejercicio ya no está disponible”.
- **`localStorage` no está disponible** (modo privado o bloqueado): la app
  funciona igual, pero el circuito se pierde al cerrar la página.

### Si un día hay usuarios

La misma forma pasa a dos tablas: la configuración en una fila y las
estaciones como filas aparte, con su posición.

**circuitos**

| id | usuario_id | trabajo | descanso | vueltas | actualizado_en |
|---|---|---|---|---|---|
| 1 | 42 | 40 | 20 | 3 | 2026-10-17 10:00 |

**circuito_estaciones**

| circuito_id | posicion | ejercicio_id |
|---|---|---|
| 1 | 1 | 0043 |
| 1 | 2 | 0025 |
| 1 | 3 | 0652 |
| 1 | 4 | 0001 |
| 1 | 5 | 0002 |

**circuito_calentamiento**

| circuito_id | posicion | ejercicio_id | segundos |
|---|---|---|---|
| 1 | 1 | 0685 | 45 |
| 1 | 2 | 3224 | 30 |

- `usuario_id` es lo único nuevo: dice de quién es el circuito.
- `posicion` reemplaza el orden del arreglo.
- Si un día se permiten varios circuitos por usuario, no cambia nada: solo hay
  más filas en `circuitos`.
- La primera vez que alguien inicia sesión, se sube lo que tenía en
  `localStorage` a estas tablas.
