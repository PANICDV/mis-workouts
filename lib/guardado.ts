import { useSyncExternalStore } from "react";
import type { PasoCalentamiento } from "./circuitos";

// Forma guardada en localStorage (ver CONTEXT.md, sección 3).
export const CLAVE_CIRCUITO = "mis-workouts:circuito";

export type CircuitoGuardado = {
  version: 1;
  ejercicios: string[];
  trabajo: number;
  descanso: number;
  vueltas: number;
  calentamiento?: PasoCalentamiento[];
};

export const LIMITES = {
  trabajo: { min: 5, max: 300, paso: 5 },
  descanso: { min: 0, max: 300, paso: 5 },
  vueltas: { min: 1, max: 20, paso: 1 },
} as const;

export const CIRCUITO_VACIO: CircuitoGuardado = { version: 1, ejercicios: [], trabajo: 40, descanso: 20, vueltas: 3 };

function acotar(n: number, campo: keyof typeof LIMITES): number {
  const { min, max } = LIMITES[campo];
  return Math.min(max, Math.max(min, Math.round(n)));
}

// JSON roto o con otra forma se trata igual que vacío.
function interpretar(texto: string | null): CircuitoGuardado {
  if (!texto) return CIRCUITO_VACIO;
  try {
    const c = JSON.parse(texto);
    const numeros = ["trabajo", "descanso", "vueltas"].every((k) => Number.isFinite(c?.[k]));
    const ids = Array.isArray(c?.ejercicios) && c.ejercicios.every((id: unknown) => typeof id === "string");
    if (c?.version !== 1 || !numeros || !ids) return CIRCUITO_VACIO;
    const calentamiento = Array.isArray(c.calentamiento)
      ? c.calentamiento.filter(
          (p: PasoCalentamiento) => typeof p?.ejercicio === "string" && Number.isFinite(p?.segundos) && p.segundos > 0,
        )
      : undefined;
    return {
      version: 1,
      ejercicios: c.ejercicios,
      trabajo: acotar(c.trabajo, "trabajo"),
      descanso: acotar(c.descanso, "descanso"),
      vueltas: acotar(c.vueltas, "vueltas"),
      ...(calentamiento?.length ? { calentamiento } : {}),
    };
  } catch {
    return CIRCUITO_VACIO;
  }
}

// Si localStorage no está disponible, el circuito vive solo en memoria hasta cerrar la página.
let actual: CircuitoGuardado | undefined;
const oyentes = new Set<() => void>();

function leer(): CircuitoGuardado {
  if (actual === undefined) {
    try {
      actual = interpretar(localStorage.getItem(CLAVE_CIRCUITO));
    } catch {
      actual = CIRCUITO_VACIO;
    }
  }
  return actual;
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  // Cambios hechos en otra pestaña.
  const alCambiar = (ev: StorageEvent) => {
    if (ev.key !== CLAVE_CIRCUITO) return;
    actual = undefined;
    oyente();
  };
  window.addEventListener("storage", alCambiar);
  return () => {
    oyentes.delete(oyente);
    window.removeEventListener("storage", alCambiar);
  };
}

// Devuelve false si no se pudo escribir en localStorage (el cambio sí queda en memoria).
export function guardarCircuito(c: CircuitoGuardado): boolean {
  actual = c;
  let ok = true;
  try {
    localStorage.setItem(CLAVE_CIRCUITO, JSON.stringify(c));
  } catch {
    ok = false;
  }
  oyentes.forEach((o) => o());
  return ok;
}

export function cambiarCircuito(cambio: (c: CircuitoGuardado) => CircuitoGuardado): boolean {
  return guardarCircuito(cambio(leer()));
}

export function agregarEjercicio(id: string): number {
  let n = 0;
  cambiarCircuito((c) => {
    n = c.ejercicios.length + 1;
    return { ...c, ejercicios: [...c.ejercicios, id] };
  });
  return n;
}

export function configurar(campo: keyof typeof LIMITES, valor: number) {
  cambiarCircuito((c) => ({ ...c, [campo]: acotar(valor, campo) }));
}

// null mientras se hidrata: en el servidor no hay localStorage.
export function useCircuito(): CircuitoGuardado | null {
  return useSyncExternalStore(suscribir, leer, () => null);
}
