import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/src/Interface/Ui/Components/Shared/providers";
import Aurora from "@/src/Interface/Ui/Components/Shared/react-bits/Aurora";

export const metadata: Metadata = {
  title: "Statio OKR",
  description: "Enterprise OKR dashboard with AI insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground selection:bg-primary/30 antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            {/* Aurora background glow — covers entire content area */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-50 dark:opacity-70 transition-opacity duration-1000">
              <Aurora
                colorStops={["#3b0764", "#6d28d9", "#1e1b4b"]}
                amplitude={1.2}
                blend={0.6}
                speed={0.4}
              />
            </div>
            <div className="relative flex-1">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
