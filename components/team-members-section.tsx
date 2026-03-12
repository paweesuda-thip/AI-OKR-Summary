"use client";

import { useState } from 'react';
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";

export interface TeamMember {
    employeeId: string;
    employeeName: string;
    picture: string;
    employeeStatus: number;
    positionName: string;
}

export default function TeamMembersSection({ teamMembers = [] }: { teamMembers: TeamMember[] }) {
    const [expanded, setExpanded] = useState(false);

    if (!teamMembers || teamMembers.length === 0) return null;

    const activeCount   = teamMembers.filter(m => m.employeeStatus === 1).length;
    const inactiveCount = teamMembers.filter(m => m.employeeStatus === 2).length;
    const resignedCount = teamMembers.filter(m => m.employeeStatus === 3).length;

    return (
        <Card className="border-border shadow-sm overflow-hidden mt-8">
            <Collapsible open={expanded} onOpenChange={setExpanded}>
                <CollapsibleTrigger className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-muted/30 transition-colors group bg-muted/10 border-b border-border/60">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 shadow-sm">
                                <Users className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl font-bold text-foreground tracking-tight leading-tight">Team Members</h2>
                                <span className="text-sm text-muted-foreground font-medium">{teamMembers.length} members</span>
                            </div>
                        </div>
                        {/* Mobile expansion indicator */}
                        <div className="sm:hidden text-muted-foreground">
                            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-6">
                            {/* Stacked avatars */}
                            <div className="flex -space-x-3">
                                {teamMembers.slice(0, 6).map((m, i) => (
                                    <Avatar 
                                        key={m.employeeId} 
                                        className="w-10 h-10 border-2 border-background shadow-sm"
                                        style={{ zIndex: 6 - i }}
                                    >
                                        <AvatarImage src={m.picture} alt={m.employeeName} />
                                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                            {m.employeeName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                                {teamMembers.length > 6 && (
                                    <Avatar className="w-10 h-10 border-2 border-background z-0 shadow-sm">
                                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                            +{teamMembers.length - 6}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>

                            {/* Status dots */}
                            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5" title="Active">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                                    {activeCount}
                                </span>
                                {inactiveCount > 0 && (
                                    <span className="flex items-center gap-1.5" title="Inactive">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
                                        {inactiveCount}
                                    </span>
                                )}
                                {resignedCount > 0 && (
                                    <span className="flex items-center gap-1.5" title="Resigned">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                                        {resignedCount}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Desktop expansion indicator */}
                        <div className="hidden sm:block text-muted-foreground group-hover:text-foreground transition-colors">
                            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="px-6 py-5 border-t border-border bg-muted/5">
                        {/* Mobile Status Dots (visible only when expanded on mobile) */}
                        <div className="flex md:hidden items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border font-medium">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                                <span className="text-foreground font-semibold">Active</span>
                                <span className="ml-1 px-1.5 bg-background border border-border shadow-sm rounded">{activeCount}</span>
                            </span>
                            {inactiveCount > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
                                    <span className="text-foreground font-semibold">Inactive</span>
                                    <span className="ml-1 px-1.5 bg-background border border-border shadow-sm rounded">{inactiveCount}</span>
                                </span>
                            )}
                            {resignedCount > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                                    <span className="text-foreground font-semibold">Resigned</span>
                                    <span className="ml-1 px-1.5 bg-background border border-border shadow-sm rounded">{resignedCount}</span>
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.employeeId}
                                    className="flex items-center gap-3 bg-background border border-border rounded-xl p-3 hover:shadow-md transition-all shadow-sm group"
                                >
                                    <Avatar className="w-11 h-11 border border-border relative shadow-sm group-hover:border-muted-foreground/30 transition-colors">
                                        <AvatarImage src={member.picture} alt={member.employeeName} />
                                        <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                                            {member.employeeName?.charAt(0)}
                                        </AvatarFallback>
                                        
                                    </Avatar>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold text-foreground truncate">{member.employeeName}</p>
                                            <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${
                                                member.employeeStatus === 1 ? 'bg-emerald-500' :
                                                member.employeeStatus === 2 ? 'bg-amber-500' : 'bg-rose-500'
                                            }`} title={
                                                member.employeeStatus === 1 ? 'Active' :
                                                member.employeeStatus === 2 ? 'Inactive' : 'Resigned'
                                            } />
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium" title={member.positionName}>
                                            {member.positionName || 'No position specified'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
