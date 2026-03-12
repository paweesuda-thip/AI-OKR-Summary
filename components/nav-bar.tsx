"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FlaskConical, Sparkles } from "lucide-react";
import ShinyText from "@/components/react-bits/ShinyText";
import { ModeToggle } from "@/components/mode-toggle";

export default function NavBar() {
    const pathname = usePathname();

    return (
        <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none sm:top-6">
            <div className="pointer-events-auto flex items-center justify-between gap-2 rounded-full border border-white/10 bg-[#0a0a0a]/30 p-1.5 pl-3 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-3xl backdrop-saturate-[1.5] sm:gap-6 sm:pl-4">
                
                {/* Left: Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-linear-to-b from-white/20 to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <ShinyText
                        text="Stratio OKR"
                        className="hidden pr-2 text-sm font-semibold tracking-wide text-white/90 sm:block"
                        color="#e2e8f0"
                        shineColor="#ffffff"
                        speed={3}
                        spread={120}
                    />
                </div>

                {/* Divider */}
                <div className="hidden h-4 w-px bg-white/10 sm:block" />

                {/* Center: Navigation */}
                <nav className="flex items-center gap-1">
                    <Link
                        href="/"
                        className={cn(
                            "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                            pathname === "/"
                                ? "bg-white/15 text-white shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.15)]"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <Link
                        href="/test"
                        className={cn(
                            "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                            pathname === "/test"
                                ? "bg-white/15 text-white shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.15)]"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <FlaskConical className="h-4 w-4" />
                        <span className="hidden sm:inline">API Test</span>
                    </Link>
                </nav>

                {/* Right: Status */}
                <div className="hidden items-center justify-center pl-2 pr-2 sm:flex">
                    <div className="flex cursor-default items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-white/5">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Sys Core</span>
                    </div>
                    <div className="ml-2 h-4 w-px bg-white/10" />
                    <div className="ml-2 flex items-center">
                        <ModeToggle />
                    </div>
                </div>

            </div>
        </header>
    );
}
