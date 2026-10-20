import { ejercicioPorId, ids } from "@/lib/datos";

// Se genera un JSON estático por ejercicio al compilar.
export async function generateStaticParams() {
  return ids.map((id) => ({ id }));
}

export async function GET(_request: Request, { params }: RouteContext<"/api/ejercicios/[id]">) {
  const { id } = await params;
  const ejercicio = ejercicioPorId(id);
  if (!ejercicio) {
    return Response.json({ error: "Ejercicio no encontrado" }, { status: 404 });
  }
  return Response.json(ejercicio);
}
