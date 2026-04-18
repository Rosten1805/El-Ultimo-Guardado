import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "romSphere ⦿ load your childhood",
  description:
    "A seamless, modern platform to experience your favorite retro games directly in the browser.",
  openGraph: {
    title: "romSphere ⦿ load your childhood",
    description: "A seamless, modern platform to experience your favorite retro games directly in the browser.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
