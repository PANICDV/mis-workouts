import { etiquetas, resumenes } from "@/lib/datos";
import Explorar from "./explorar";

export default function Home() {
  return (
    <>
      <h1 className="mb-4 font-display text-4xl font-extrabold uppercase">Explorar</h1>
      <Explorar ejercicios={resumenes} etiquetas={etiquetas} />
    </>
  );
}
