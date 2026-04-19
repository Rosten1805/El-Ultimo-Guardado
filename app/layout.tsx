import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "El Último Guardado",
  description:
    "Tu biblioteca de videojuegos retro. Explora, descubre y revive los clásicos que marcaron una era.",
  openGraph: {
    title: "El Último Guardado",
    description: "Tu biblioteca de videojuegos retro. Explora, descubre y revive los clásicos que marcaron una era.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
