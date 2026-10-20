import { formatoTiempo } from "@/lib/circuitos";
import type { EjercicioResumen, Etiquetas } from "@/lib/tipos";

// Por músculo protagonista: veces por vuelta, segundos por vuelta y total (ver CONTEXT.md, 2.3).
export default function Distribucion({
  estaciones,
  trabajo,
  vueltas,
  etiquetas,
}: {
  estaciones: EjercicioResumen[];
  trabajo: number;
  vueltas: number;
  etiquetas: Etiquetas;
}) {
  if (!estaciones.length) return null;
  const cuenta = new Map<string, number>();
  for (const e of estaciones) {
    const m = etiquetas.target[e.target] ?? e.target;
    cuenta.set(m, (cuenta.get(m) ?? 0) + 1);
  }
  const filas = [...cuenta].sort((a, b) => b[1] - a[1]);
  const max = filas[0][1];
  return (
    <div className="mt-8">
      <h3 className="mb-3 font-display text-base font-bold tracking-widest text-tenue uppercase">Distribución muscular</h3>
      <div className="flex flex-col gap-2">
        {filas.map(([musculo, n]) => (
          <div key={musculo} className="grid grid-cols-[110px_1fr] items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[150px_1fr_auto]">
            <span>{musculo}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-superficie-2">
              <span
                className="block h-full rounded-full bg-lima transition-[width] duration-500"
                style={{ width: `${(n / max) * 100}%` }}
              />
            </span>
            <span className="col-span-2 text-tenue tabular-nums sm:col-span-1">
              {n}×/vuelta · {n * trabajo} s · total {formatoTiempo(n * trabajo * vueltas)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
