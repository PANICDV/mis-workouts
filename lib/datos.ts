// Solo para el servidor: carga el dataset completo (~1 MB) una vez por proceso.
import ejerciciosJson from "@/data/exercises.es.json";
import etiquetasJson from "@/data/etiquetas.es.json";
import type { Ejercicio, EjercicioResumen, Etiquetas } from "./tipos";

const ejercicios = ejerciciosJson as Ejercicio[];
const porId = new Map(ejercicios.map((e) => [e.id, e]));

export const etiquetas = etiquetasJson as Etiquetas;

export const resumenes: EjercicioResumen[] = ejercicios.map(
  ({ id, name, body_part, target, equipment, image, gif_url }) =>
    ({ id, name, body_part, target, equipment, image, gif_url }),
);

export const ids = ejercicios.map((e) => e.id);

const resumenPorIdMapa = new Map(resumenes.map((e) => [e.id, e]));

// Para Mi circuito y Entrenar, que pueden tener cualquier ejercicio del dataset.
export const resumenesPorId: Record<string, EjercicioResumen> = Object.fromEntries(resumenPorIdMapa);

export function ejercicioPorId(id: string): Ejercicio | undefined {
  return porId.get(id);
}

export function resumenPorId(id: string): EjercicioResumen | undefined {
  return resumenPorIdMapa.get(id);
}
