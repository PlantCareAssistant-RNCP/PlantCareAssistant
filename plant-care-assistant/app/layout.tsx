// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import { AuthProvider } from "../providers/AuthProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#06141B] text-white min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
