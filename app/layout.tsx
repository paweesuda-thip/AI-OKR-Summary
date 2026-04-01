import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Aurora from "@/components/react-bits/Aurora";

export const metadata: Metadata = {
  title: "Statio OKR",
  description: "Enterprise OKR dashboard — Spartan Command",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
        <body className="min-h-screen bg-background text-foreground selection:bg-primary/30 antialiased">
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                forcedTheme="dark"
                disableTransitionOnChange
            >
                <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                    {/* Aurora background — multi-color subtle glow */}
                    <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 transition-opacity duration-1000">
                        <Aurora
                            colorStops={["#0c0a1a", "#1e1b4b", "#0f172a"]}
                            amplitude={1.0}
                            blend={0.6}
                            speed={0.25}
                        />
                    </div>
                    <div className="relative flex-1">
                        {children}
                    </div>
                </div>
            </ThemeProvider>
        </body>
    </html>
  );
}
