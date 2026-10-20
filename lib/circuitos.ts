// Circuitos sugeridos de calistenia (solo peso corporal) y sus calentamientos.
// Todos los IDs existen en data/exercises.es.json; app/circuitos/page.tsx lo comprueba.

export type PasoCalentamiento = { ejercicio: string; segundos: number };

export type Calentamiento = {
  id: string;
  nombre: string;
  pasos: PasoCalentamiento[];
};

export type CircuitoSugerido = {
  slug: string;
  nombre: string;
  para: "Hombres" | "Mujeres" | "Todos";
  nivel: "Principiante" | "Intermedio" | "Avanzado" | "Todos los niveles";
  objetivo: string;
  descripcion: string;
  nota?: string;
  calentamiento: string;
  trabajo: number;
  descanso: number;
  vueltas: number;
  ejercicios: string[];
};

export const CALENTAMIENTOS: Calentamiento[] = [
  {
    id: "general",
    nombre: "Calentamiento general",
    pasos: [
      { ejercicio: "0685", segundos: 45 }, // run: trote en el sitio
      { ejercicio: "3224", segundos: 30 }, // jack jump
      { ejercicio: "3221", segundos: 30 }, // half knee bends
      { ejercicio: "1687", segundos: 30 }, // posterior step to overhead reach
      { ejercicio: "1471", segundos: 45 }, // inchworm
      { ejercicio: "1604", segundos: 45 }, // world greatest stretch
      { ejercicio: "3214", segundos: 30 }, // arms apart circular toe touch
    ],
  },
  {
    id: "suave",
    nombre: "Calentamiento suave y de core",
    pasos: [
      { ejercicio: "3672", segundos: 45 }, // back and forth step
      { ejercicio: "0257", segundos: 30 }, // circles knee stretch
      { ejercicio: "1685", segundos: 45 }, // squat to overhead reach
      { ejercicio: "1422", segundos: 45 }, // pelvic tilt into bridge
      { ejercicio: "0276", segundos: 45 }, // dead bug
      { ejercicio: "1471", segundos: 30 }, // inchworm
    ],
  },
];

export const CIRCUITOS: CircuitoSugerido[] = [
  {
    slug: "quema-grasa-hombres",
    nombre: "Quema grasa",
    para: "Hombres",
    nivel: "Intermedio",
    objetivo: "Quemar grasa",
    descripcion:
      "Cuerpo completo con énfasis en pecho, brazos y empuje. Mezcla saltos y fuerza para mantener el pulso alto.",
    calentamiento: "general",
    trabajo: 40,
    descanso: 20,
    vueltas: 3,
    ejercicios: ["1160", "0662", "0514", "0630", "1399", "3582", "0464", "3361"],
  },
  {
    slug: "quema-grasa-mujeres",
    nombre: "Quema grasa",
    para: "Mujeres",
    nivel: "Intermedio",
    objetivo: "Quemar grasa",
    descripcion:
      "Cuerpo completo con énfasis en piernas y glúteos, más cardio sin impacto excesivo en las muñecas.",
    calentamiento: "general",
    trabajo: 40,
    descanso: 20,
    vueltas: 3,
    ejercicios: ["3224", "3119", "3013", "0630", "3769", "0493", "3220", "0459"],
  },
  {
    slug: "abdomen-plano",
    nombre: "Abdomen plano",
    para: "Mujeres",
    nivel: "Todos los niveles",
    objetivo: "Core y cintura",
    descripcion:
      "Abdominales, oblicuos y estabilidad del core. Trabajo corto y descanso corto para que el abdomen no se enfríe.",
    nota:
      "Estos ejercicios fortalecen y marcan el abdomen, pero la grasa no se quema por zonas: para un abdomen plano combínalo con un circuito de quema grasa y una alimentación adecuada.",
    calentamiento: "suave",
    trabajo: 30,
    descanso: 15,
    vueltas: 3,
    ejercicios: ["0003", "0872", "0687", "0630", "0276", "0006", "3665"],
  },
  {
    slug: "principiante-en-casa",
    nombre: "Principiante en casa",
    para: "Todos",
    nivel: "Principiante",
    objetivo: "Empezar sin impacto",
    descripcion:
      "Bajo impacto y sin saltos: ideal para empezar, para volver después de una pausa o para un día de recuperación.",
    calentamiento: "suave",
    trabajo: 30,
    descanso: 30,
    vueltas: 2,
    ejercicios: ["3221", "0659", "1422", "3672", "0276", "3671"],
  },
  {
    slug: "hiit-expres",
    nombre: "HIIT exprés",
    para: "Todos",
    nivel: "Avanzado",
    objetivo: "Quemar grasa en poco tiempo",
    descripcion:
      "Formato tipo Tabata: 20 segundos a tope y 10 de descanso. Menos de 8 minutos, pero muy intenso.",
    calentamiento: "general",
    trabajo: 20,
    descanso: 10,
    vueltas: 4,
    ejercicios: ["1160", "0514", "0630", "3636"],
  },
  {
    slug: "piernas-y-gluteos",
    nombre: "Piernas y glúteos",
    para: "Todos",
    nivel: "Intermedio",
    objetivo: "Tonificar tren inferior",
    descripcion:
      "Sentadillas, zancadas y puentes para glúteos, cuádriceps y pantorrillas, con un salto para subir el pulso.",
    calentamiento: "general",
    trabajo: 45,
    descanso: 15,
    vueltas: 3,
    ejercicios: ["3119", "2368", "3561", "3769", "1774", "0514", "1373"],
  },
];

export function calentamientoDe(c: CircuitoSugerido): Calentamiento {
  return CALENTAMIENTOS.find((k) => k.id === c.calentamiento)!;
}

// Sin descanso después de la última estación de la última vuelta (ver CONTEXT.md).
export function duracionCircuito(estaciones: number, trabajo: number, descanso: number, vueltas: number): number {
  const periodos = estaciones * vueltas;
  return periodos ? periodos * trabajo + (periodos - 1) * descanso : 0;
}

export function duracionCalentamiento(k: Calentamiento): number {
  return k.pasos.reduce((s, p) => s + p.segundos, 0);
}

export function formatoTiempo(segundos: number): string {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
}
