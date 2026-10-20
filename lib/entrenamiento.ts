// Línea de tiempo del entrenamiento: calentamiento sin descansos y luego trabajo → descanso
// por cada estación y vuelta. Sin descanso después de la última estación de la última vuelta.
import type { PasoCalentamiento } from "./circuitos";

export type Fase = {
  tipo: "calentamiento" | "trabajo" | "descanso";
  segundos: number;
  // En descanso, el ejercicio y la posición son los de la estación que sigue.
  ejercicio: string;
  vuelta: number;
  estacion: number;
  paso: number;
};

export function fases(
  ejercicios: string[],
  trabajo: number,
  descanso: number,
  vueltas: number,
  calentamiento: PasoCalentamiento[] = [],
): Fase[] {
  if (!ejercicios.length) return [];
  const out: Fase[] = calentamiento.map((p, paso) => ({
    tipo: "calentamiento",
    segundos: p.segundos,
    ejercicio: p.ejercicio,
    vuelta: 0,
    estacion: -1,
    paso,
  }));
  const n = ejercicios.length;
  for (let v = 1; v <= vueltas; v++) {
    for (let i = 0; i < n; i++) {
      out.push({ tipo: "trabajo", segundos: trabajo, ejercicio: ejercicios[i], vuelta: v, estacion: i, paso: -1 });
      const ultima = v === vueltas && i === n - 1;
      if (!ultima && descanso > 0) {
        const sv = i === n - 1 ? v + 1 : v;
        const si = (i + 1) % n;
        out.push({ tipo: "descanso", segundos: descanso, ejercicio: ejercicios[si], vuelta: sv, estacion: si, paso: -1 });
      }
    }
  }
  return out;
}

export type Reloj = {
  indice: number;
  restanteMs: number;
  corriendo: boolean;
  empezado: boolean;
  terminado: boolean;
};

export function relojInicial(f: Fase[]): Reloj {
  return { indice: 0, restanteMs: (f[0]?.segundos ?? 0) * 1000, corriendo: false, empezado: false, terminado: false };
}

// Pasa a la fase siguiente; `sobrante` son los ms que ya corrieron de más en la anterior.
export function siguienteFase(r: Reloj, f: Fase[], sobrante = 0): Reloj {
  const indice = r.indice + 1;
  if (indice >= f.length) return { ...r, restanteMs: 0, corriendo: false, empezado: true, terminado: true };
  return { ...r, indice, restanteMs: f[indice].segundos * 1000 - sobrante, empezado: true };
}

export function correr(r: Reloj, f: Fase[], ms: number): Reloj {
  let s = { ...r, restanteMs: r.restanteMs - ms };
  while (s.restanteMs <= 0 && !s.terminado) s = siguienteFase(s, f, -s.restanteMs);
  return s;
}

export function restanteTotal(r: Reloj, f: Fase[]): number {
  if (r.terminado) return 0;
  return r.restanteMs / 1000 + f.slice(r.indice + 1).reduce((s, x) => s + x.segundos, 0);
}
