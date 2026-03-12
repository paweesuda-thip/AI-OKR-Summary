import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/nav-bar";

export const metadata: Metadata = {
  title: "Stratio - OKR Team Dashboard",
  description: "AI-powered OKR dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="font-sans antialiased min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30"
      >
        <NavBar />
        {children}
      </body>
    </html>
  );
}
