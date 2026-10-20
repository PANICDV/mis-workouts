import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import Encabezado from "./encabezado";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Mis Workouts",
  description: "Arma tu circuito de ejercicios por tiempo y entrénalo con un temporizador.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Encabezado />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-12">{children}</main>
        <footer className="border-t border-borde px-4 py-5 text-center text-sm text-tenue">
          <p>
            Imágenes © Gym visual —{" "}
            <a href="https://gymvisual.com/" className="underline hover:text-texto" target="_blank" rel="noopener noreferrer">
              gymvisual.com
            </a>
          </p>
          <p className="mt-1 text-xs">
            Datos:{" "}
            <a
              href="https://github.com/hasaneyldrm/exercises-dataset"
              className="underline hover:text-texto"
              target="_blank"
              rel="noopener noreferrer"
            >
              exercises-dataset
            </a>{" "}
            © 2026 Hasan Emir Yıldırım, licencia MIT
          </p>
        </footer>
      </body>
    </html>
  );
}
