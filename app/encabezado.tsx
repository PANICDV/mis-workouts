"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCircuito } from "@/lib/guardado";

const SECCIONES = [
  { href: "/", texto: "Explorar" },
  { href: "/circuitos", texto: "Circuitos" },
  { href: "/mi-circuito", texto: "Mi circuito" },
  { href: "/entrenar", texto: "Entrenar" },
];

export default function Encabezado() {
  const ruta = usePathname();
  const estaciones = useCircuito()?.ejercicios.length ?? 0;
  return (
    <header className="sticky top-0 z-10 border-b border-borde bg-pantalla/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-black uppercase tracking-wide">
          <span className="grid size-7 -skew-x-6 place-items-center rounded-md bg-lima text-base text-lima-tinta">⚡</span>
          MIS <span className="text-lima">WORKOUTS</span>
        </Link>
        <nav className="flex max-w-full gap-1 overflow-x-auto font-display text-sm font-bold uppercase tracking-wider">
          {SECCIONES.map((s) => {
            const activa = ruta === s.href;
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={activa ? "page" : undefined}
                className={`shrink-0 rounded-full px-3 py-2 whitespace-nowrap transition ${
                  activa ? "bg-lima text-lima-tinta" : "text-tenue hover:bg-superficie-2 hover:text-texto"
                }`}
              >
                {s.texto}
                {s.href === "/mi-circuito" && estaciones > 0 && (
                  <span
                    key={estaciones}
                    className={`ml-1.5 inline-grid min-w-5 animate-aparecer place-items-center rounded-full px-1 text-xs ${
                      activa ? "bg-lima-tinta text-lima" : "bg-lima text-lima-tinta"
                    }`}
                  >
                    {estaciones}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
