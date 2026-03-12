import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/nav-bar";

export const metadata: Metadata = {
  title: "Stratio - OKR Team Dashboard",
  description: "Enterprise OKR dashboard with AI insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground selection:bg-primary/20">
        <div className="relative flex min-h-screen flex-col">
          <NavBar />
          <div className="flex-1 bg-muted/30">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
