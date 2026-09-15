import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Joana Souto | Front-end, design e ilustração digital",
  description:
    "Portfólio de Joana Souto, desenvolvedora front-end, designer e ilustradora digital.",
  icons: { icon: "/favicon.ico" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="m-0 overflow-hidden font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
