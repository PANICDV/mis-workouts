"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { normalizar, textoBuscable } from "@/lib/busqueda";
import { CDN, type EjercicioResumen, type Etiquetas } from "@/lib/tipos";
import { BotonAgregar, useDetalleEjercicio } from "./detalle-ejercicio";

const POR_PAGINA = 48;

type Props = { ejercicios: EjercicioResumen[]; etiquetas: Etiquetas };

export default function Explorar({ ejercicios, etiquetas }: Props) {
  const [consulta, setConsulta] = useState("");
  const [parte, setParte] = useState("");
  const [equipo, setEquipo] = useState("");
  const [limite, setLimite] = useState(POR_PAGINA);
  const detalle = useDetalleEjercicio(etiquetas);

  const buscables = useMemo(
    () => ejercicios.map((e) => textoBuscable(e, etiquetas)),
    [ejercicios, etiquetas],
  );

  const opcionesParte = useMemo(() => opciones(ejercicios, "body_part", etiquetas.body_part), [ejercicios, etiquetas]);
  const opcionesEquipo = useMemo(() => opciones(ejercicios, "equipment", etiquetas.equipment), [ejercicios, etiquetas]);

  const resultados = useMemo(() => {
    const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
    return ejercicios.filter(
      (e, i) =>
        (!parte || e.body_part === parte) &&
        (!equipo || e.equipment === equipo) &&
        palabras.every((p) => buscables[i].includes(p)),
    );
  }, [ejercicios, buscables, consulta, parte, equipo]);

  const visibles = resultados.slice(0, limite);

  function filtrar(cambio: () => void) {
    cambio();
    setLimite(POR_PAGINA);
  }

  const hayFiltros = consulta || parte || equipo;

  return (
    <>
      <label className="flex items-center gap-3 rounded-2xl border border-borde bg-superficie px-4 transition focus-within:border-lima focus-within:shadow-[0_0_0_4px_rgb(198_255_46/0.12)]">
        <span aria-hidden>🔍</span>
        <input
          type="search"
          value={consulta}
          onChange={(ev) => filtrar(() => setConsulta(ev.target.value))}
          placeholder="Buscar ejercicio… (sentadilla, press, dominada)"
          aria-label="Buscar ejercicio"
          className="min-w-0 flex-1 bg-transparent py-3 text-texto outline-none placeholder:text-tenue"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <Filtro etiqueta="Cuerpo" todos="Todas" valor={parte} opciones={opcionesParte} onChange={(v) => filtrar(() => setParte(v))} />
        <Filtro etiqueta="Equipo" todos="Todos" valor={equipo} opciones={opcionesEquipo} onChange={(v) => filtrar(() => setEquipo(v))} />
        {hayFiltros && (
          <button
            type="button"
            onClick={() => filtrar(() => { setConsulta(""); setParte(""); setEquipo(""); })}
            className="rounded-full px-3 text-sm font-semibold text-tenue transition hover:text-texto"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      <p className="mt-3 mb-4 text-sm text-tenue" aria-live="polite">
        Mostrando {visibles.length.toLocaleString("es")} de {resultados.length.toLocaleString("es")} ejercicios
      </p>

      {resultados.length === 0 ? (
        <div className="animate-aparecer rounded-2xl border border-dashed border-borde px-4 py-10 text-center text-tenue">
          <b className="mb-1 block font-display text-2xl font-extrabold uppercase text-texto">Sin resultados</b>
          Prueba otra palabra o quita un filtro.
        </div>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {visibles.map((e, i) => (
            <li
              key={e.id}
              className="group flex animate-aparecer flex-col overflow-hidden rounded-2xl border border-borde bg-superficie transition duration-200 hover:-translate-y-1 hover:border-lima"
              style={{ animationDelay: `${(i % POR_PAGINA) * 12}ms` }}
            >
              <button type="button" onClick={() => detalle.abrir(e)} className="flex flex-1 cursor-pointer flex-col text-left">
                <span className="block bg-white">
                  <Image
                    src={CDN + e.image}
                    alt={e.name}
                    width={180}
                    height={180}
                    unoptimized
                    className="mx-auto aspect-square w-full max-w-[180px]"
                  />
                </span>
                <span className="flex flex-1 flex-col gap-2 px-3 pt-2.5">
                  <span className="font-display text-lg leading-tight font-bold uppercase">{e.name}</span>
                  <span className="flex flex-wrap gap-1">
                    <Tag>{etiquetas.body_part[e.body_part]}</Tag>
                    <Tag>{etiquetas.equipment[e.equipment]}</Tag>
                  </span>
                </span>
              </button>
              <div className="p-3">
                <BotonAgregar id={e.id} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {resultados.length > limite && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setLimite((l) => l + POR_PAGINA)}
            className="rounded-xl border border-borde bg-superficie-2 px-6 py-3 font-display text-lg font-bold uppercase tracking-wider transition hover:border-lima hover:text-lima active:scale-95"
          >
            Ver más · quedan {(resultados.length - limite).toLocaleString("es")}
          </button>
        </div>
      )}

      {detalle.ventana}
    </>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-superficie-2 px-2 py-0.5 text-xs font-semibold text-tenue">{children}</span>;
}

function Filtro({
  etiqueta,
  todos,
  valor,
  opciones,
  onChange,
}: {
  etiqueta: string;
  todos: string;
  valor: string;
  opciones: { valor: string; texto: string; cuenta: number }[];
  onChange: (v: string) => void;
}) {
  return (
    <label
      className={`inline-flex items-center gap-1 rounded-full border pl-3 pr-1 text-sm font-semibold transition ${
        valor ? "border-lima bg-lima/12 text-lima" : "border-borde bg-superficie"
      }`}
    >
      <span className="font-medium text-tenue">{etiqueta}:</span>
      <select
        value={valor}
        onChange={(ev) => onChange(ev.target.value)}
        className="cursor-pointer bg-transparent py-1.5 pr-1 outline-none [&>option]:bg-superficie [&>option]:text-texto"
      >
        <option value="">{todos}</option>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto} ({o.cuenta})
          </option>
        ))}
      </select>
    </label>
  );
}

// Valores distintos de un campo, con su texto en español y cuántos ejercicios tiene cada uno.
function opciones(ejercicios: EjercicioResumen[], campo: "body_part" | "equipment", textos: Record<string, string>) {
  const cuenta = new Map<string, number>();
  for (const e of ejercicios) cuenta.set(e[campo], (cuenta.get(e[campo]) ?? 0) + 1);
  return [...cuenta]
    .map(([valor, n]) => ({ valor, texto: textos[valor] ?? valor, cuenta: n }))
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));
}
