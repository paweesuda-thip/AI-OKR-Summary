"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FlaskConical } from "lucide-react";

export default function NavBar() {
    const pathname = usePathname();

    return (
        <div className="fixed top-0 right-0 z-50 p-4 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
            <Link
                href="/"
                className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm shadow-sm",
                    pathname === "/"
                        ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20"
                        : "bg-card/80 backdrop-blur-md text-muted-foreground hover:text-foreground hover:bg-card border border-border"
                )}
            >
                <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
                href="/test"
                className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm shadow-sm",
                    pathname === "/test"
                        ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20"
                        : "bg-card/80 backdrop-blur-md text-muted-foreground hover:text-foreground hover:bg-card border border-border"
                )}
            >
                <FlaskConical className="w-4 h-4" /> <span className="hidden sm:inline">API Test</span>
            </Link>
        </div>
    );
}
