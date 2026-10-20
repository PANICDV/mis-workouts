import type { Metadata } from "next";
import { CALENTAMIENTOS, CIRCUITOS } from "@/lib/circuitos";
import { etiquetas, resumenPorId } from "@/lib/datos";
import type { EjercicioResumen } from "@/lib/tipos";
import Circuitos from "./circuitos";

export const metadata: Metadata = {
  title: "Circuitos · Mis Workouts",
};

// Solo se envían al navegador los ejercicios que usan los circuitos y calentamientos.
function ejerciciosUsados(): Record<string, EjercicioResumen> {
  const ids = new Set([
    ...CIRCUITOS.flatMap((c) => c.ejercicios),
    ...CALENTAMIENTOS.flatMap((k) => k.pasos.map((p) => p.ejercicio)),
  ]);
  const usados: Record<string, EjercicioResumen> = {};
  for (const id of ids) {
    const e = resumenPorId(id);
    if (!e) throw new Error(`lib/circuitos.ts usa el ejercicio ${id}, que no existe en el dataset`);
    usados[id] = e;
  }
  return usados;
}

export default function CircuitosPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Circuitos</h1>
      <p className="mt-1 mb-5 text-tenue">
        Circuitos de calistenia listos para usar: solo necesitas tu cuerpo. Cada uno trae su calentamiento.
      </p>
      <Circuitos
        circuitos={CIRCUITOS}
        calentamientos={CALENTAMIENTOS}
        ejercicios={ejerciciosUsados()}
        etiquetas={etiquetas}
      />
    </>
  );
}
