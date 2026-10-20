"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { duracionCircuito, formatoTiempo, type Calentamiento } from "@/lib/circuitos";
import { cambiarCircuito, configurar, LIMITES, useCircuito, type CircuitoGuardado } from "@/lib/guardado";
import { CDN, type EjercicioResumen, type Etiquetas } from "@/lib/tipos";
import { useDetalleEjercicio } from "../detalle-ejercicio";
import Distribucion from "../distribucion";

type Props = {
  ejercicios: Record<string, EjercicioResumen>;
  etiquetas: Etiquetas;
  calentamientos: Calentamiento[];
};

export default function MiCircuito({ ejercicios, etiquetas, calentamientos }: Props) {
  const circuito = useCircuito();
  const detalle = useDetalleEjercicio(etiquetas);
  const [arrastrando, setArrastrando] = useState<number | null>(null);
  const [destino, setDestino] = useState<number | null>(null);

  if (!circuito) return <p className="animate-pulse text-tenue">Cargando tu circuito…</p>;

  // Los IDs que ya no existen en el dataset se ignoran; se borran al siguiente cambio.
  const existe = (id: string) => id in ejercicios;
  const ids = circuito.ejercicios.filter(existe);
  const pasos = (circuito.calentamiento ?? []).filter((p) => existe(p.ejercicio));
  const perdidos = circuito.ejercicios.length - ids.length + (circuito.calentamiento?.length ?? 0) - pasos.length;

  function cambiar(cambio: (c: CircuitoGuardado) => Partial<CircuitoGuardado>) {
    cambiarCircuito((c) => ({
      ...c,
      ejercicios: c.ejercicios.filter(existe),
      ...(c.calentamiento ? { calentamiento: c.calentamiento.filter((p) => existe(p.ejercicio)) } : {}),
      ...cambio(c),
    }));
  }

  function mover(de: number, a: number) {
    if (de === a) return;
    cambiar(() => {
      const nuevo = [...ids];
      const [id] = nuevo.splice(de, 1);
      nuevo.splice(a, 0, id);
      return { ejercicios: nuevo };
    });
  }

  const quitar = (i: number) => cambiar(() => ({ ejercicios: ids.filter((_, j) => j !== i) }));
  const quitarCalentamiento = () => cambiar(() => ({ calentamiento: undefined }));
  const usarCalentamiento = (k: Calentamiento) => cambiar(() => ({ calentamiento: k.pasos }));

  const tCalentamiento = pasos.reduce((s, p) => s + p.segundos, 0);
  const tCircuito = duracionCircuito(ids.length, circuito.trabajo, circuito.descanso, circuito.vueltas);
  const periodos = ids.length * circuito.vueltas;

  return (
    <>
      {perdidos > 0 && (
        <p className="mb-4 rounded-2xl border border-descanso/40 bg-descanso/10 p-3 text-sm" role="status">
          {perdidos === 1 ? "1 ejercicio ya no está disponible" : `${perdidos} ejercicios ya no están disponibles`}.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Ajuste campo="trabajo" titulo="Trabajo" valor={circuito.trabajo} unidad="s" />
        <Ajuste campo="descanso" titulo="Descanso" valor={circuito.descanso} unidad="s" />
        <Ajuste campo="vueltas" titulo="Vueltas" valor={circuito.vueltas} />
      </div>

      <div className="my-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lima bg-lima/10 px-5 py-4">
        <div>
          <small className="block font-display text-sm font-bold tracking-widest text-lima uppercase">Duración total</small>
          <strong key={tCalentamiento + tCircuito} className="inline-block animate-aparecer font-display text-5xl font-black tabular-nums">
            {formatoTiempo(tCalentamiento + tCircuito)}
          </strong>{" "}
          <span className="text-sm text-tenue">
            {ids.length
              ? `· ${ids.length} estacion${ids.length === 1 ? "" : "es"} × ${circuito.vueltas} vuelta${circuito.vueltas === 1 ? "" : "s"}`
              : "· circuito vacío"}
            {pasos.length > 0 && ` + calentamiento ${formatoTiempo(tCalentamiento)}`}
          </span>
        </div>
        {ids.length ? (
          <Link
            href="/entrenar"
            className="rounded-2xl bg-lima px-6 py-3.5 font-display text-xl font-bold tracking-wider text-lima-tinta uppercase transition hover:shadow-[0_0_0_4px_rgb(198_255_46/0.12),0_0_24px_rgb(198_255_46/0.35)] active:scale-95"
          >
            ▶ Entrenar
          </Link>
        ) : (
          <span
            aria-disabled
            className="cursor-not-allowed rounded-2xl bg-superficie-2 px-6 py-3.5 font-display text-xl font-bold tracking-wider text-tenue uppercase"
          >
            ▶ Entrenar
          </span>
        )}
      </div>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-extrabold uppercase">
            Calentamiento{" "}
            <span className="text-base font-bold text-tenue">
              {pasos.length ? `· ${formatoTiempo(tCalentamiento)}, una sola vez y sin descansos` : "· opcional"}
            </span>
          </h2>
          {pasos.length > 0 && (
            <button type="button" onClick={quitarCalentamiento} className="text-sm font-semibold text-tenue hover:text-texto">
              ✕ Quitar calentamiento
            </button>
          )}
        </div>
        {pasos.length ? (
          <ol className="flex flex-col gap-2">
            {pasos.map((p, i) => (
              <Fila key={`${p.ejercicio}-${i}`} n={i + 1} e={ejercicios[p.ejercicio]} etiquetas={etiquetas} onAbrir={detalle.abrir}>
                <span className="font-display text-lg font-bold text-tenue tabular-nums">{p.segundos} s</span>
              </Fila>
            ))}
          </ol>
        ) : (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-borde p-4 text-sm text-tenue">
            Sin calentamiento. Agregar:
            {calentamientos.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => usarCalentamiento(k)}
                className="rounded-full border border-borde bg-superficie px-3 py-1.5 font-semibold text-texto transition hover:border-lima hover:text-lima"
              >
                + {k.nombre} ({formatoTiempo(k.pasos.reduce((s, p) => s + p.segundos, 0))})
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-2xl font-extrabold uppercase">
          Estaciones{" "}
          {ids.length > 1 && <span className="text-base font-bold text-tenue">· arrastra o usa ↑ ↓ para reordenar</span>}
        </h2>
        {ids.length ? (
          <ol className="flex flex-col gap-2">
            {ids.map((id, i) => (
              <Fila
                key={`${id}-${i}`}
                n={i + 1}
                e={ejercicios[id]}
                etiquetas={etiquetas}
                onAbrir={detalle.abrir}
                arrastre={{
                  activo: arrastrando === i,
                  destino: destino === i && arrastrando !== i,
                  onDragStart: () => setArrastrando(i),
                  onDragOver: () => setDestino(i),
                  onDrop: () => arrastrando !== null && mover(arrastrando, i),
                  onDragEnd: () => {
                    setArrastrando(null);
                    setDestino(null);
                  },
                }}
              >
                <span className="flex gap-1">
                  <BotonIcono etiqueta="Subir" disabled={i === 0} onClick={() => mover(i, i - 1)}>
                    ↑
                  </BotonIcono>
                  <BotonIcono etiqueta="Bajar" disabled={i === ids.length - 1} onClick={() => mover(i, i + 1)}>
                    ↓
                  </BotonIcono>
                  <BotonIcono etiqueta="Quitar" onClick={() => quitar(i)}>
                    ✕
                  </BotonIcono>
                </span>
              </Fila>
            ))}
          </ol>
        ) : (
          <div className="animate-aparecer rounded-2xl border border-dashed border-borde px-4 py-10 text-center text-tenue">
            <b className="mb-1 block font-display text-2xl font-extrabold text-texto uppercase">Tu circuito está vacío</b>
            Agrega ejercicios desde Explorar o elige uno de los circuitos sugeridos.
            <span className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                href="/"
                className="rounded-xl bg-lima px-5 py-2.5 font-display text-lg font-bold tracking-wider text-lima-tinta uppercase"
              >
                Ir a Explorar
              </Link>
              <Link
                href="/circuitos"
                className="rounded-xl border border-borde bg-superficie-2 px-5 py-2.5 font-display text-lg font-bold tracking-wider text-texto uppercase hover:border-lima"
              >
                Ver circuitos
              </Link>
            </span>
          </div>
        )}
      </section>

      <Distribucion
        estaciones={ids.map((id) => ejercicios[id])}
        trabajo={circuito.trabajo}
        vueltas={circuito.vueltas}
        etiquetas={etiquetas}
      />

      {periodos > 0 && (
        <p className="mt-6 text-sm text-tenue">
          Circuito: {formatoTiempo(tCircuito)} = {periodos} periodos de trabajo de {circuito.trabajo} s (
          {periodos * circuito.trabajo} s) + {periodos - 1} descansos de {circuito.descanso} s (
          {(periodos - 1) * circuito.descanso} s). Después de la última estación de la última vuelta no hay descanso.
        </p>
      )}

      {detalle.ventana}
    </>
  );
}

function Ajuste({
  campo,
  titulo,
  valor,
  unidad,
}: {
  campo: keyof typeof LIMITES;
  titulo: string;
  valor: number;
  unidad?: string;
}) {
  const { min, max, paso } = LIMITES[campo];
  return (
    <div className="rounded-2xl border border-borde bg-superficie p-3">
      <small className="block font-display text-xs font-bold tracking-widest text-tenue uppercase sm:text-sm">{titulo}</small>
      <div className="mt-2 flex items-center justify-between gap-1">
        <BotonIcono etiqueta={`Menos ${titulo.toLowerCase()}`} disabled={valor <= min} onClick={() => configurar(campo, valor - paso)}>
          −
        </BotonIcono>
        <span key={valor} className="inline-block animate-aparecer font-display text-3xl font-extrabold tabular-nums sm:text-4xl">
          {valor}
          {unidad && <em className="text-lg font-bold text-tenue not-italic">{unidad}</em>}
        </span>
        <BotonIcono etiqueta={`Más ${titulo.toLowerCase()}`} disabled={valor >= max} onClick={() => configurar(campo, valor + paso)}>
          +
        </BotonIcono>
      </div>
    </div>
  );
}

function BotonIcono({
  etiqueta,
  disabled = false,
  onClick,
  children,
}: {
  etiqueta: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 shrink-0 place-items-center rounded-lg border border-borde bg-superficie-2 font-bold transition hover:border-lima hover:text-lima active:scale-90 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

type Arrastre = {
  activo: boolean;
  destino: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
};

function Fila({
  n,
  e,
  etiquetas,
  onAbrir,
  arrastre,
  children,
}: {
  n: number;
  e: EjercicioResumen;
  etiquetas: Etiquetas;
  onAbrir: (e: EjercicioResumen) => void;
  arrastre?: Arrastre;
  children: React.ReactNode;
}) {
  return (
    <li
      draggable={!!arrastre}
      onDragStart={(ev) => {
        ev.dataTransfer.effectAllowed = "move";
        arrastre?.onDragStart();
      }}
      onDragOver={(ev) => {
        if (!arrastre) return;
        ev.preventDefault();
        arrastre.onDragOver();
      }}
      onDrop={(ev) => {
        ev.preventDefault();
        arrastre?.onDrop();
      }}
      onDragEnd={arrastre?.onDragEnd}
      className={`grid animate-aparecer grid-cols-[28px_52px_1fr_auto] items-center gap-3 rounded-2xl border bg-superficie p-2 pr-3 transition ${
        arrastre ? "cursor-grab active:cursor-grabbing" : ""
      } ${arrastre?.activo ? "opacity-40" : ""} ${arrastre?.destino ? "border-lima" : "border-borde"}`}
    >
      <span className="text-center font-display text-2xl font-black text-lima">{n}</span>
      <Image src={CDN + e.image} alt="" width={52} height={52} unoptimized className="size-[52px] rounded-xl bg-white" draggable={false} />
      <button type="button" onClick={() => onAbrir(e)} className="min-w-0 text-left hover:text-lima">
        <span className="block font-display text-lg leading-tight font-bold uppercase">{e.name}</span>
        <span className="block text-sm text-tenue">
          {etiquetas.target[e.target]} · {etiquetas.equipment[e.equipment]}
        </span>
      </button>
      {children}
    </li>
  );
}
