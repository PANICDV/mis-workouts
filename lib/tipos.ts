// Las imágenes se sirven desde el repositorio original vía jsDelivr.
export const CDN = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/";

// Un ejercicio tal como está en data/exercises.es.json.
export type Ejercicio = {
  id: string;
  name: string;
  body_part: string;
  target: string;
  equipment: string;
  image: string;
  gif_url: string;
  instrucciones: string[];
};

// Lo que necesita la grilla: todo menos las instrucciones, que se piden al abrir el detalle.
export type EjercicioResumen = Omit<Ejercicio, "instrucciones">;

// data/etiquetas.es.json: valor en inglés → texto en español.
export type Etiquetas = {
  body_part: Record<string, string>;
  target: Record<string, string>;
  equipment: Record<string, string>;
};
