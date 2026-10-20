import type { EjercicioResumen, Etiquetas } from "./tipos";

// Quita acentos y pasa a minúsculas: "Glúteos" y "gluteos" se comparan igual.
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Los nombres vienen solo en inglés. Este diccionario añade las palabras en español
// más comunes para que "sentadilla" encuentre "squat". Las claves van sin guiones.
const SINONIMOS: Record<string, string> = {
  "squat": "sentadilla",
  "push up": "flexion lagartija",
  "pull up": "dominada",
  "chin up": "dominada supina",
  "bench press": "press de banca",
  "deadlift": "peso muerto",
  "row": "remo",
  "lunge": "zancada",
  "crunch": "abdominal",
  "sit up": "abdominal",
  "plank": "plancha",
  "raise": "elevacion",
  "fly": "apertura",
  "dip": "fondos",
  "calf": "pantorrilla gemelo",
  "bridge": "puente",
  "jump": "salto",
  "stretch": "estiramiento",
  "extension": "extension",
  "shrug": "encogimiento",
  "kickback": "patada",
  "pulldown": "jalon",
  "twist": "giro rotacion",
  "rotation": "rotacion",
  "climber": "escalador",
  "hip thrust": "empuje de cadera",
  "step up": "subida al cajon",
  "incline": "inclinado",
  "decline": "declinado",
  "seated": "sentado",
  "standing": "de pie",
  "lying": "acostado tumbado",
  "one arm": "un brazo",
  "single leg": "una pierna",
  "reverse": "inverso",
  "close grip": "agarre cerrado",
  "wide grip": "agarre abierto",
  "walk": "caminar",
  "run": "correr",
  "jack": "tijera",
  "hold": "isometrico",
  "rear": "posterior",
  "front": "frontal",
  "side": "lateral",
};

const PATRONES = Object.entries(SINONIMOS).map(
  ([en, es]) => [new RegExp(`\\b${en}`), es] as const,
);

// Texto en el que se busca: nombre + equivalentes en español + etiquetas traducidas.
export function textoBuscable(e: EjercicioResumen, et: Etiquetas): string {
  const nombre = normalizar(e.name).replace(/-/g, " ");
  const extras = PATRONES.filter(([re]) => re.test(nombre)).map(([, es]) => es);
  return normalizar(
    [
      nombre,
      ...extras,
      et.body_part[e.body_part],
      et.target[e.target],
      et.equipment[e.equipment],
    ].join(" "),
  );
}
