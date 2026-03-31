import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spartan OKR",
  description: "Elite OKR Command Center — Team Spartan Performance Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#030304] text-white antialiased selection:bg-[#F7931A]/30 overflow-x-hidden">
        <div className="relative flex min-h-screen flex-col">
          {/* Background Grid Pattern */}
          <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-pattern opacity-100" />

          {/* Ambient Glow Orbs */}
          <div className="pointer-events-none fixed -z-10 inset-0 overflow-hidden">
            {/* Top-right orange glow */}
            <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[#F7931A] opacity-[0.04] blur-[150px]" />
            {/* Bottom-left burnt orange glow */}
            <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] rounded-full bg-[#EA580C] opacity-[0.03] blur-[120px]" />
            {/* Center gold glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#FFD600] opacity-[0.015] blur-[180px]" />
          </div>

          <div className="relative flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
