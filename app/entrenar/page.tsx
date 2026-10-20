import type { Metadata } from "next";
import { etiquetas, resumenesPorId } from "@/lib/datos";
import Entrenar from "./entrenar";

export const metadata: Metadata = {
  title: "Entrenar · Mis Workouts",
};

export default function EntrenarPage() {
  return (
    <>
      <h1 className="sr-only">Entrenar</h1>
      <Entrenar ejercicios={resumenesPorId} etiquetas={etiquetas} />
    </>
  );
}
