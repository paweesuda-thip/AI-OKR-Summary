import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Aurora from "@/components/react-bits/Aurora";

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
    <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background text-foreground selection:bg-primary/30 antialiased">
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >
                <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                    {/* Aurora background glow */}
                    <div className="pointer-events-none fixed inset-0 -z-10 opacity-50 dark:opacity-70 transition-opacity duration-1000">
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
            </ThemeProvider>
        </body>
    </html>
  );
}
