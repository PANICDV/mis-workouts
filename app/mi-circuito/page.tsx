import type { Metadata } from "next";
import { CALENTAMIENTOS } from "@/lib/circuitos";
import { etiquetas, resumenesPorId } from "@/lib/datos";
import MiCircuito from "./mi-circuito";

export const metadata: Metadata = {
  title: "Mi circuito · Mis Workouts",
};

export default function MiCircuitoPage() {
  return (
    <>
      <h1 className="mb-4 font-display text-4xl font-extrabold uppercase">Mi circuito</h1>
      <MiCircuito ejercicios={resumenesPorId} etiquetas={etiquetas} calentamientos={CALENTAMIENTOS} />
    </>
  );
}
