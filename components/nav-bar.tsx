"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NavBar() {
    const pathname = usePathname();

    return (
        <div className="fixed top-0 right-0 z-50 p-4 flex gap-2">
            <Link
                href="/"
                className={cn(
                    "px-4 py-2 rounded font-medium transition-colors flex items-center gap-2",
                    pathname === "/"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                )}
            >
                <span>📊</span> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
                href="/test"
                className={cn(
                    "px-4 py-2 rounded font-medium transition-colors flex items-center gap-2",
                    pathname === "/test"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                )}
            >
                <span>🧪</span> <span className="hidden sm:inline">API Test</span>
            </Link>
        </div>
    );
}
