"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { agregarEjercicio } from "@/lib/guardado";
import { CDN, type Ejercicio, type EjercicioResumen, type Etiquetas } from "@/lib/tipos";

// undefined = cargando, null = error
type Pasos = Record<string, string[] | null>;

// Ventana de detalle de un ejercicio. Devuelve `abrir(ejercicio)` y el <dialog> que hay que pintar.
export function useDetalleEjercicio(etiquetas: Etiquetas) {
  const [seleccionado, setSeleccionado] = useState<EjercicioResumen | null>(null);
  const [pasos, setPasos] = useState<Pasos>({});
  const dialogo = useRef<HTMLDialogElement>(null);

  function abrir(e: EjercicioResumen) {
    setSeleccionado(e);
    dialogo.current?.showModal();
    if (e.id in pasos) return;
    fetch(`/api/ejercicios/${e.id}`)
      .then((r) => (r.ok ? (r.json() as Promise<Ejercicio>) : Promise.reject(r.status)))
      .then((d) => setPasos((p) => ({ ...p, [e.id]: d.instrucciones })))
      .catch(() => setPasos((p) => ({ ...p, [e.id]: null })));
  }

  const ventana = (
    <dialog
      ref={dialogo}
      onClose={() => setSeleccionado(null)}
      onClick={(ev) => ev.target === ev.currentTarget && dialogo.current?.close()}
      className="m-auto w-[min(560px,calc(100%-32px))] max-h-[calc(100dvh-32px)] overflow-hidden rounded-3xl border border-borde bg-pantalla p-0 text-texto open:animate-subir"
      aria-labelledby="detalle-titulo"
    >
      {seleccionado && (
        <Detalle
          ejercicio={seleccionado}
          etiquetas={etiquetas}
          pasos={pasos[seleccionado.id]}
          cargando={!(seleccionado.id in pasos)}
          onCerrar={() => dialogo.current?.close()}
        />
      )}
    </dialog>
  );

  return { abrir, ventana };
}

function Detalle({
  ejercicio: e,
  etiquetas,
  pasos,
  cargando,
  onCerrar,
}: {
  ejercicio: EjercicioResumen;
  etiquetas: Etiquetas;
  pasos: string[] | null | undefined;
  cargando: boolean;
  onCerrar: () => void;
}) {
  return (
    <div className="flex max-h-[calc(100dvh-32px)] flex-col">
      <div className="flex items-start gap-4 border-b border-borde p-5">
        {/* El GIF se muestra a su tamaño original: el dataset solo se distribuye a 180×180. */}
        <Image
          src={CDN + e.gif_url}
          alt={`Animación de ${e.name}`}
          width={180}
          height={180}
          unoptimized
          className="size-[120px] shrink-0 rounded-2xl border-2 border-lima bg-white sm:size-[180px]"
        />
        <div className="min-w-0 flex-1">
          <h2 id="detalle-titulo" className="font-display text-3xl leading-none font-extrabold uppercase">
            {e.name}
          </h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-tenue">Cuerpo</dt>
            <dd>{etiquetas.body_part[e.body_part]}</dd>
            <dt className="text-tenue">Músculo</dt>
            <dd>{etiquetas.target[e.target]}</dd>
            <dt className="text-tenue">Equipo</dt>
            <dd>{etiquetas.equipment[e.equipment]}</dd>
          </dl>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-borde bg-superficie-2 transition hover:border-tenue active:scale-90"
        >
          ✕
        </button>
      </div>

      <div className="overflow-y-auto p-5">
        <h3 className="mb-3 font-display text-base font-bold tracking-widest text-tenue uppercase">Paso a paso</h3>
        {cargando ? (
          <p className="animate-pulse text-tenue">Cargando pasos…</p>
        ) : pasos ? (
          <ol className="space-y-3">
            {pasos.map((paso, i) => (
              <li key={i} className="flex animate-aparecer gap-3" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-lima font-display font-black text-lima-tinta">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{paso}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-tenue">No se pudieron cargar los pasos. Cierra y vuelve a intentarlo.</p>
        )}
      </div>

      <div className="border-t border-borde p-4">
        <BotonAgregar id={e.id} grande />
      </div>
    </div>
  );
}

// Agrega el ejercicio como nueva estación al final de Mi circuito.
export function BotonAgregar({ id, grande = false }: { id: string; grande?: boolean }) {
  const [estacion, setEstacion] = useState<number | null>(null);
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);

  function agregar() {
    setEstacion(agregarEjercicio(id));
    clearTimeout(espera.current);
    espera.current = setTimeout(() => setEstacion(null), 1400);
  }

  return (
    <button
      type="button"
      onClick={agregar}
      className={`w-full rounded-xl font-display font-bold tracking-wider uppercase transition hover:shadow-[0_0_0_4px_rgb(198_255_46/0.12),0_0_24px_rgb(198_255_46/0.35)] active:scale-95 ${
        estacion ? "bg-lima/15 text-lima" : "bg-lima text-lima-tinta"
      } ${grande ? "py-3 text-xl" : "py-2 text-[15px]"}`}
    >
      <span aria-live="polite">{estacion ? `✓ Estación ${estacion}` : "+ Agregar"}</span>
    </button>
  );
}
