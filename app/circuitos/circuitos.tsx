"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  duracionCalentamiento,
  duracionCircuito,
  formatoTiempo,
  type Calentamiento,
  type CircuitoSugerido,
} from "@/lib/circuitos";
import { guardarCircuito } from "@/lib/guardado";
import { CDN, type EjercicioResumen, type Etiquetas } from "@/lib/tipos";
import { useDetalleEjercicio } from "../detalle-ejercicio";
import Distribucion from "../distribucion";

type Props = {
  circuitos: CircuitoSugerido[];
  calentamientos: Calentamiento[];
  ejercicios: Record<string, EjercicioResumen>;
  etiquetas: Etiquetas;
};

const FILTROS = ["Todos", "Mujeres", "Hombres"] as const;
type Filtro = (typeof FILTROS)[number];

export default function Circuitos({ circuitos, calentamientos, ejercicios, etiquetas }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [slug, setSlug] = useState(circuitos[0].slug);
  const [guardado, setGuardado] = useState<{ slug: string; ok: boolean } | null>(null);
  const panel = useRef<HTMLElement>(null);
  const detalle = useDetalleEjercicio(etiquetas);

  const filtrar = (f: Filtro) => circuitos.filter((c) => f === "Todos" || c.para === f || c.para === "Todos");
  const visibles = filtrar(filtro);
  const c = circuitos.find((x) => x.slug === slug)!;
  const k = calentamientos.find((x) => x.id === c.calentamiento)!;

  function cambiarFiltro(f: Filtro) {
    setFiltro(f);
    const nuevos = filtrar(f);
    if (!nuevos.some((x) => x.slug === slug)) {
      setSlug(nuevos[0].slug);
      setGuardado(null);
    }
  }

  function elegir(nuevo: string) {
    setSlug(nuevo);
    setGuardado(null);
    requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function usar() {
    const ok = guardarCircuito({
      version: 1,
      ejercicios: c.ejercicios,
      trabajo: c.trabajo,
      descanso: c.descanso,
      vueltas: c.vueltas,
      calentamiento: k.pasos,
    });
    setGuardado({ slug: c.slug, ok });
  }

  const tCalentamiento = duracionCalentamiento(k);
  const tCircuito = duracionCircuito(c.ejercicios.length, c.trabajo, c.descanso, c.vueltas);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Para quién">
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => cambiarFiltro(f)}
            aria-pressed={filtro === f}
            className={`rounded-full border px-4 py-1.5 font-display text-sm font-bold tracking-wider uppercase transition active:scale-95 ${
              filtro === f ? "border-lima bg-lima text-lima-tinta" : "border-borde bg-superficie text-tenue hover:text-texto"
            }`}
          >
            {f === "Todos" ? "Todos" : `Para ${f.toLowerCase()}`}
          </button>
        ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((x, i) => {
          const kx = calentamientos.find((y) => y.id === x.calentamiento)!;
          const total = duracionCalentamiento(kx) + duracionCircuito(x.ejercicios.length, x.trabajo, x.descanso, x.vueltas);
          const activo = x.slug === slug;
          return (
            <li key={x.slug} className="animate-aparecer" style={{ animationDelay: `${i * 50}ms` }}>
              <button
                type="button"
                onClick={() => elegir(x.slug)}
                aria-pressed={activo}
                className={`flex h-full w-full flex-col gap-3 rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-1 ${
                  activo ? "border-lima bg-lima/10 shadow-[0_0_0_1px_var(--color-lima)]" : "border-borde bg-superficie hover:border-tenue"
                }`}
              >
                <span className="flex flex-wrap gap-1">
                  <Chip resaltado={x.para !== "Todos"}>{x.para === "Todos" ? "Para todos" : `Para ${x.para.toLowerCase()}`}</Chip>
                  <Chip>{x.nivel}</Chip>
                </span>
                <span>
                  <span className="block font-display text-2xl leading-none font-extrabold uppercase">{x.nombre}</span>
                  <span className="mt-1 block text-sm text-tenue">{x.objetivo}</span>
                </span>
                <span className="flex -space-x-2">
                  {x.ejercicios.slice(0, 6).map((id, j) => (
                    <Image
                      key={`${id}-${j}`}
                      src={CDN + ejercicios[id].image}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="size-10 rounded-full border-2 border-superficie bg-white"
                    />
                  ))}
                </span>
                <span className="mt-auto flex items-end justify-between gap-2">
                  <span className="font-display text-3xl font-black text-lima tabular-nums">{formatoTiempo(total)}</span>
                  <span className="text-right text-xs text-tenue">
                    {x.ejercicios.length} ejercicios
                    <br />
                    {x.trabajo} s / {x.descanso} s × {x.vueltas}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <section
        ref={panel}
        key={c.slug}
        aria-labelledby="circuito-titulo"
        className="mt-8 scroll-mt-24 animate-subir rounded-3xl border border-borde bg-pantalla p-5 sm:p-6"
      >
        <div className="flex flex-wrap gap-1">
          <Chip resaltado={c.para !== "Todos"}>{c.para === "Todos" ? "Para todos" : `Para ${c.para.toLowerCase()}`}</Chip>
          <Chip>{c.nivel}</Chip>
          <Chip>Calistenia · sin equipo</Chip>
        </div>
        <h2 id="circuito-titulo" className="mt-3 font-display text-4xl leading-none font-extrabold uppercase">
          {c.nombre}
        </h2>
        <p className="mt-2 max-w-prose text-tenue">{c.descripcion}</p>

        <dl className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Dato titulo="Calentamiento" valor={formatoTiempo(tCalentamiento)} />
          <Dato titulo="Circuito" valor={formatoTiempo(tCircuito)} />
          <Dato titulo="Total" valor={formatoTiempo(tCalentamiento + tCircuito)} resaltado />
          <Dato titulo="Trabajo" valor={`${c.trabajo} s`} />
          <Dato titulo="Descanso" valor={`${c.descanso} s`} />
          <Dato titulo="Vueltas" valor={String(c.vueltas)} />
        </dl>

        {c.nota && (
          <p className="mt-4 rounded-2xl border border-descanso/40 bg-descanso/10 p-4 text-sm leading-relaxed">
            <b className="text-descanso">Importante: </b>
            {c.nota}
          </p>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={usar}
            className="w-full rounded-2xl bg-lima py-4 font-display text-xl font-bold tracking-wider text-lima-tinta uppercase transition hover:shadow-[0_0_0_4px_rgb(198_255_46/0.12),0_0_24px_rgb(198_255_46/0.35)] active:scale-[0.98] sm:w-auto sm:px-10"
          >
            ✓ Usar este circuito
          </button>
          {guardado?.slug === c.slug && (
            <p className="mt-3 animate-aparecer text-sm" role="status">
              {guardado.ok ? (
                <>
                  <b className="text-lima">Guardado como tu circuito.</b>{" "}
                  <span className="text-tenue">
                    Ajústalo en{" "}
                    <Link href="/mi-circuito" className="underline hover:text-texto">
                      Mi circuito
                    </Link>{" "}
                    o{" "}
                    <Link href="/entrenar" className="font-semibold text-lima underline">
                      empieza a entrenar
                    </Link>
                    .
                  </span>
                </>
              ) : (
                <span className="text-descanso">No se pudo guardar en este navegador (¿modo privado?).</span>
              )}
            </p>
          )}
        </div>

        <Bloque
          numero={1}
          titulo={k.nombre}
          subtitulo={`${formatoTiempo(tCalentamiento)} · una sola vez, sin descansos`}
        >
          {k.pasos.map((p, i) => (
            <Fila key={`${p.ejercicio}-${i}`} n={i + 1} e={ejercicios[p.ejercicio]} etiquetas={etiquetas} tiempo={`${p.segundos} s`} onAbrir={detalle.abrir} />
          ))}
        </Bloque>

        <Bloque
          numero={2}
          titulo="Circuito"
          subtitulo={`${c.vueltas} vueltas · ${c.trabajo} s de trabajo y ${c.descanso} s de descanso por estación`}
        >
          {c.ejercicios.map((id, i) => (
            <Fila key={`${id}-${i}`} n={i + 1} e={ejercicios[id]} etiquetas={etiquetas} tiempo={`${c.trabajo} s`} onAbrir={detalle.abrir} />
          ))}
        </Bloque>

        <Distribucion
          estaciones={c.ejercicios.map((id) => ejercicios[id])}
          trabajo={c.trabajo}
          vueltas={c.vueltas}
          etiquetas={etiquetas}
        />
      </section>

      {detalle.ventana}
    </>
  );
}

function Bloque({
  numero,
  titulo,
  subtitulo,
  children,
}: {
  numero: number;
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h3 className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-black text-lima">{numero}</span>
        <span className="font-display text-2xl font-extrabold uppercase">{titulo}</span>
      </h3>
      <p className="mb-3 text-sm text-tenue">{subtitulo}</p>
      <ol className="flex flex-col gap-2">{children}</ol>
    </div>
  );
}

function Fila({
  n,
  e,
  etiquetas,
  tiempo,
  onAbrir,
}: {
  n: number;
  e: EjercicioResumen;
  etiquetas: Etiquetas;
  tiempo: string;
  onAbrir: (e: EjercicioResumen) => void;
}) {
  return (
    <li className="animate-aparecer" style={{ animationDelay: `${n * 40}ms` }}>
      <button
        type="button"
        onClick={() => onAbrir(e)}
        className="grid w-full grid-cols-[28px_52px_1fr_auto] items-center gap-3 rounded-2xl border border-borde bg-superficie p-2 pr-4 text-left transition hover:border-lima"
      >
        <span className="text-center font-display text-2xl font-black text-lima">{n}</span>
        <Image src={CDN + e.image} alt="" width={52} height={52} unoptimized className="size-[52px] rounded-xl bg-white" />
        <span className="min-w-0">
          <span className="block font-display text-lg leading-tight font-bold uppercase">{e.name}</span>
          <span className="block text-sm text-tenue">
            {etiquetas.target[e.target]} · {etiquetas.body_part[e.body_part]}
          </span>
        </span>
        <span className="font-display text-lg font-bold text-tenue tabular-nums">{tiempo}</span>
      </button>
    </li>
  );
}

function Dato({ titulo, valor, resaltado = false }: { titulo: string; valor: string; resaltado?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${resaltado ? "border-lima bg-lima/10" : "border-borde bg-superficie"}`}>
      <dt className="font-display text-xs font-bold tracking-widest text-tenue uppercase">{titulo}</dt>
      <dd className={`font-display text-2xl font-black tabular-nums ${resaltado ? "text-lima" : ""}`}>{valor}</dd>
    </div>
  );
}

function Chip({ children, resaltado = false }: { children: React.ReactNode; resaltado?: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        resaltado ? "bg-lima/15 text-lima" : "bg-superficie-2 text-tenue"
      }`}
    >
      {children}
    </span>
  );
}
