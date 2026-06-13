import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jeu de l'oie",
  description: "Un jeu de l'oie multijoueur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
