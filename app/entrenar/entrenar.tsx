"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { formatoTiempo } from "@/lib/circuitos";
import { correr, fases as armarFases, relojInicial, restanteTotal, siguienteFase, type Fase } from "@/lib/entrenamiento";
import { useCircuito } from "@/lib/guardado";
import { CDN, type EjercicioResumen, type Etiquetas } from "@/lib/tipos";

type Props = { ejercicios: Record<string, EjercicioResumen>; etiquetas: Etiquetas };

const COLOR: Record<Fase["tipo"] | "fin", string> = {
  calentamiento: "var(--color-calentamiento)",
  trabajo: "var(--color-lima)",
  descanso: "var(--color-descanso)",
  fin: "var(--color-lima)",
};

const NOMBRE: Record<Fase["tipo"], string> = {
  calentamiento: "Calentamiento",
  trabajo: "Trabajo",
  descanso: "Descanso",
};

export default function Entrenar({ ejercicios, etiquetas }: Props) {
  const circuito = useCircuito();
  if (!circuito) return <p className="animate-pulse text-tenue">Cargando tu circuito…</p>;

  const ids = circuito.ejercicios.filter((id) => id in ejercicios);
  const calentamiento = (circuito.calentamiento ?? []).filter((p) => p.ejercicio in ejercicios);

  if (!ids.length) {
    return (
      <div className="animate-aparecer rounded-2xl border border-dashed border-borde px-4 py-12 text-center text-tenue">
        <b className="mb-1 block font-display text-3xl font-extrabold text-texto uppercase">Nada que entrenar</b>
        Agrega al menos un ejercicio a tu circuito.
        <span className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/" className="rounded-xl bg-lima px-5 py-2.5 font-display text-lg font-bold tracking-wider text-lima-tinta uppercase">
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
    );
  }

  // Si el circuito cambia (por ejemplo, en otra pestaña), el entrenamiento empieza de cero.
  const clave = JSON.stringify([ids, circuito.trabajo, circuito.descanso, circuito.vueltas, calentamiento]);
  return (
    <Entrenamiento
      key={clave}
      ids={ids}
      trabajo={circuito.trabajo}
      descanso={circuito.descanso}
      vueltas={circuito.vueltas}
      calentamiento={calentamiento}
      ejercicios={ejercicios}
      etiquetas={etiquetas}
    />
  );
}

function Entrenamiento({
  ids,
  trabajo,
  descanso,
  vueltas,
  calentamiento,
  ejercicios,
  etiquetas,
}: {
  ids: string[];
  trabajo: number;
  descanso: number;
  vueltas: number;
  calentamiento: { ejercicio: string; segundos: number }[];
} & Props) {
  const lista = useMemo(
    () => armarFases(ids, trabajo, descanso, vueltas, calentamiento),
    // La clave del componente ya cambia cuando cambia el circuito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [reloj, setReloj] = useState(() => relojInicial(lista));
  const [sonido, setSonido] = useState(true);
  const audio = useRef<AudioContext | null>(null);

  function pitido(frecuencia: number, ms: number) {
    if (!sonido) return;
    try {
      audio.current ??= new AudioContext();
      const ctx = audio.current;
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = frecuencia;
      vol.gain.setValueAtTime(0.08, ctx.currentTime);
      vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
      osc.connect(vol).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + ms / 1000);
    } catch {}
  }

  // El temporizador mide el tiempo real transcurrido, así no se atrasa si el navegador se ralentiza.
  useEffect(() => {
    if (!reloj.corriendo) return;
    let anterior = performance.now();
    let cuadro = requestAnimationFrame(function paso(ahora) {
      const ms = ahora - anterior;
      anterior = ahora;
      setReloj((r) => correr(r, lista, ms));
      cuadro = requestAnimationFrame(paso);
    });
    return () => cancelAnimationFrame(cuadro);
  }, [reloj.corriendo, lista]);

  // Pantalla encendida mientras se entrena.
  useEffect(() => {
    if (!reloj.corriendo || !("wakeLock" in navigator)) return;
    let candado: WakeLockSentinel | undefined;
    navigator.wakeLock.request("screen").then((c) => (candado = c), () => {});
    return () => void candado?.release();
  }, [reloj.corriendo]);

  // Pitidos: tres cortos al final de cada fase, uno al cambiar y dos al terminar.
  const segundo = Math.ceil(reloj.restanteMs / 1000);
  useEffect(() => {
    if (reloj.corriendo && segundo >= 1 && segundo <= 3) pitido(880, 110);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundo]);
  useEffect(() => {
    if (!reloj.empezado) return;
    if (reloj.terminado) {
      pitido(660, 180);
      setTimeout(() => pitido(990, 400), 200);
    } else {
      pitido(lista[reloj.indice].tipo === "descanso" ? 520 : 1180, 260);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloj.indice, reloj.terminado]);

  function alternar() {
    void audio.current?.resume();
    setReloj((r) => (r.terminado ? { ...relojInicial(lista), corriendo: true, empezado: true } : { ...r, corriendo: !r.corriendo, empezado: true }));
  }
  const saltar = () => setReloj((r) => (r.terminado ? r : siguienteFase(r, lista)));
  const reiniciar = () => setReloj(relojInicial(lista));

  // Espacio: pausa y sigue.
  const tecla = useEffectEvent((ev: KeyboardEvent) => {
    if (ev.code !== "Space" || (ev.target as HTMLElement).closest("button, input, select, textarea")) return;
    ev.preventDefault();
    alternar();
  });
  useEffect(() => {
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  const f = lista[reloj.indice];
  const e = ejercicios[f.ejercicio];
  const color = reloj.terminado ? COLOR.fin : COLOR[f.tipo];
  const transcurrido = reloj.terminado ? f.segundos : f.segundos - reloj.restanteMs / 1000;
  const despues = lista[reloj.indice + 1];
  // La fase en que se hace el ejercicio que se muestra (en descanso, la siguiente).
  const mostrada = f.tipo === "descanso" ? reloj.indice + 1 : reloj.indice;
  const proxima = lista.slice(mostrada + 1).find((x) => x.tipo !== "descanso");
  const pausado = reloj.empezado && !reloj.corriendo && !reloj.terminado;
  const n = ids.length;

  return (
    <div className="mx-auto max-w-xl text-center" style={{ "--fase": color } as React.CSSProperties}>
      <div className="flex flex-wrap justify-center gap-2 font-display text-base font-bold tracking-wider uppercase">
        {f.tipo === "calentamiento" ? (
          <Pastilla>
            Calentamiento · paso <b className="text-(--fase)">{f.paso + 1}</b> de {calentamiento.length}
          </Pastilla>
        ) : (
          <>
            <Pastilla>
              Vuelta <b className="text-(--fase)">{f.vuelta}</b> de {vueltas}
            </Pastilla>
            <Pastilla>
              Estación <b className="text-(--fase)">{f.estacion + 1}</b> de {n}
            </Pastilla>
          </>
        )}
      </div>

      <div
        key={reloj.terminado ? "fin" : reloj.indice}
        className="mt-5 inline-block animate-aparecer rounded-full bg-(--fase) py-1.5 pr-4 pl-5 font-display text-lg font-black tracking-[0.24em] text-lima-tinta uppercase"
      >
        {reloj.terminado ? "¡Terminado!" : NOMBRE[f.tipo]}
      </div>

      <div
        className={`my-3 font-display text-[clamp(120px,38vw,220px)] leading-[0.86] font-black text-(--fase) tabular-nums transition-colors [text-shadow:0_0_60px_color-mix(in_srgb,var(--fase)_30%,transparent)] ${
          pausado ? "animate-pulse" : ""
        }`}
        role="timer"
        aria-live="off"
      >
        {formatoTiempo(reloj.terminado ? 0 : segundo)}
      </div>

      <div className="mx-auto max-w-md">
        <div className="h-3.5 overflow-hidden rounded-full bg-superficie-2">
          <div className="h-full rounded-full bg-(--fase)" style={{ width: `${Math.min(100, (transcurrido / f.segundos) * 100)}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between gap-2 text-sm text-tenue">
          <span>{reloj.terminado ? "Listo" : `${NOMBRE[f.tipo]} · ${Math.floor(transcurrido)} de ${f.segundos} s`}</span>
          <span>
            {reloj.terminado ? "" : despues ? `Luego: ${NOMBRE[despues.tipo].toLowerCase()} ${despues.segundos} s` : "Luego: ¡fin!"}
          </span>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-4 text-left">
        <Image
          key={e.id}
          src={CDN + e.gif_url}
          alt={`Animación de ${e.name}`}
          width={140}
          height={140}
          unoptimized
          className="size-[110px] shrink-0 animate-aparecer rounded-2xl border-2 border-(--fase) bg-white sm:size-[140px]"
        />
        <div className="min-w-0">
          <div className="font-display text-sm font-bold tracking-widest text-(--fase) uppercase">
            {reloj.terminado ? "Último ejercicio" : f.tipo === "descanso" ? "Prepárate" : "Ahora"}
          </div>
          <div className="mt-1 font-display text-3xl leading-none font-extrabold uppercase">{e.name}</div>
          <div className="mt-1 text-tenue">
            {etiquetas.target[e.target]} · {etiquetas.equipment[e.equipment]}
          </div>
        </div>
      </div>

      {reloj.terminado ? (
        <p className="mt-5 animate-subir font-display text-3xl font-extrabold text-lima uppercase">¡Circuito completado! 💪</p>
      ) : (
        <Siguiente fase={proxima} actual={lista[mostrada]} ejercicios={ejercicios} etiquetas={etiquetas} />
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Control etiqueta="Reiniciar" onClick={reiniciar}>
          ↺
        </Control>
        <button
          type="button"
          onClick={alternar}
          className="min-w-40 rounded-2xl bg-(--fase) px-6 py-3.5 font-display text-xl font-bold tracking-wider text-lima-tinta uppercase transition active:scale-95"
        >
          {reloj.terminado ? "↺ Repetir" : reloj.corriendo ? "⏸ Pausa" : reloj.empezado ? "▶ Seguir" : "▶ Empezar"}
        </button>
        <Control etiqueta="Saltar a la siguiente fase" onClick={saltar} disabled={reloj.terminado} ancho>
          Saltar ⏭
        </Control>
        <Control etiqueta={sonido ? "Silenciar" : "Activar sonido"} onClick={() => setSonido((s) => !s)}>
          {sonido ? "🔊" : "🔇"}
        </Control>
      </div>

      <Recorrido
        reloj={reloj}
        fase={lista[Math.min(mostrada, lista.length - 1)]}
        descansando={f.tipo === "descanso"}
        restante={restanteTotal(reloj, lista)}
        ids={ids}
        trabajo={trabajo}
        vueltas={vueltas}
        calentamiento={calentamiento}
        ejercicios={ejercicios}
      />
    </div>
  );
}

function Siguiente({
  fase,
  actual,
  ejercicios,
  etiquetas,
}: {
  fase: Fase | undefined;
  actual: Fase;
  ejercicios: Record<string, EjercicioResumen>;
  etiquetas: Etiquetas;
}) {
  const e = fase && ejercicios[fase.ejercicio];
  let titulo = "Siguiente";
  if (fase?.tipo === "trabajo" && actual.tipo === "calentamiento") titulo = "Siguiente · empieza el circuito";
  else if (fase?.tipo === "trabajo" && fase.vuelta !== actual.vuelta) titulo = `Siguiente · vuelta ${fase.vuelta}`;
  return (
    <div className="mx-auto mt-5 flex max-w-md items-center gap-3 rounded-2xl border border-descanso/35 bg-descanso/10 px-3 py-2.5 text-left">
      {e && <Image src={CDN + e.image} alt="" width={48} height={48} unoptimized className="size-12 rounded-lg bg-white" />}
      <div className="min-w-0">
        <small className="block font-display text-sm font-bold tracking-widest text-descanso uppercase">{titulo}</small>
        {e ? (
          <>
            <b className="font-display text-lg uppercase">{e.name}</b>{" "}
            <span className="text-tenue">· {etiquetas.target[e.target]}</span>
          </>
        ) : (
          <>
            <b className="font-display text-lg uppercase">Es el último</b> <span className="text-tenue">· ¡a tope!</span>
          </>
        )}
      </div>
    </div>
  );
}

function Recorrido({
  reloj,
  fase,
  descansando,
  restante,
  ids,
  trabajo,
  vueltas,
  calentamiento,
  ejercicios,
}: {
  reloj: { terminado: boolean };
  fase: Fase;
  descansando: boolean;
  restante: number;
  ids: string[];
  trabajo: number;
  vueltas: number;
  calentamiento: { ejercicio: string; segundos: number }[];
  ejercicios: Record<string, EjercicioResumen>;
}) {
  const enCalentamiento = fase.tipo === "calentamiento" && !reloj.terminado;
  const estado = (i: number): "hecho" | "actual" | "" => {
    if (reloj.terminado) return "hecho";
    const actual = enCalentamiento ? fase.paso : fase.estacion;
    return i < actual ? "hecho" : i === actual ? "actual" : "";
  };
  const paradas = enCalentamiento
    ? calentamiento.map((p) => ({ id: p.ejercicio, tiempo: p.segundos }))
    : ids.map((id) => ({ id, tiempo: trabajo }));

  return (
    <section className="mx-auto mt-8 max-w-md border-t border-borde pt-5 text-left">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-extrabold uppercase">{enCalentamiento ? "Calentamiento" : "Tu circuito"}</h2>
        <span className="text-sm text-tenue tabular-nums">
          {reloj.terminado ? "Completado" : `Quedan ${formatoTiempo(Math.ceil(restante))}`}
        </span>
      </div>
      <div className="mt-1 mb-3 flex gap-1.5">
        {Array.from({ length: vueltas }, (_, k) => {
          const v = k + 1;
          const hecha = reloj.terminado || (!enCalentamiento && v < fase.vuelta);
          const actual = !reloj.terminado && !enCalentamiento && v === fase.vuelta;
          return (
            <span
              key={v}
              className={`flex-1 rounded-lg py-1.5 text-center font-display text-xs font-bold tracking-wider uppercase transition ${
                hecha ? "bg-lima/15 text-lima" : actual ? "bg-(--fase) text-lima-tinta" : "bg-superficie-2 text-tenue"
              }`}
            >
              {vueltas > 6 ? v : `Vuelta ${v}`}
              {hecha && " ✓"}
            </span>
          );
        })}
      </div>
      <ol className="flex flex-col gap-1.5">
        {paradas.map((p, i) => {
          const e = ejercicios[p.id];
          const st = estado(i);
          return (
            <li
              key={`${p.id}-${i}`}
              className={`grid grid-cols-[28px_40px_1fr_auto] items-center gap-2.5 rounded-xl border px-2.5 py-1.5 transition ${
                st === "actual" ? "border-(--fase) bg-superficie-2" : "border-borde bg-superficie"
              } ${st === "hecho" ? "opacity-50" : ""}`}
            >
              <span className={`text-center font-display text-xl font-black ${st === "actual" ? "text-(--fase)" : "text-tenue"}`}>{i + 1}</span>
              <Image src={CDN + e.image} alt="" width={40} height={40} unoptimized className="size-10 rounded-lg bg-white" />
              <span className="truncate font-display leading-tight font-bold uppercase">{e.name}</span>
              <span
                className={`font-display text-xs font-bold tracking-wider uppercase ${
                  st === "hecho" ? "text-lima" : st === "actual" ? "text-(--fase)" : "text-tenue"
                }`}
              >
                {st === "hecho" ? "Hecho ✓" : st === "actual" ? (descansando ? "Sigue" : "Ahora") : `${p.tiempo} s`}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Pastilla({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-superficie-2 px-3.5 py-1.5">{children}</span>;
}

function Control({
  etiqueta,
  onClick,
  disabled = false,
  ancho = false,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  disabled?: boolean;
  ancho?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border border-borde bg-superficie-2 py-3.5 font-display text-xl font-bold tracking-wider uppercase transition hover:border-tenue active:scale-95 disabled:opacity-30 ${
        ancho ? "px-6" : "px-4"
      }`}
    >
      {children}
    </button>
  );
}
