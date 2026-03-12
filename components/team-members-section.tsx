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
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden mt-8">
            <Collapsible open={expanded} onOpenChange={setExpanded}>
                <CollapsibleTrigger className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 text-sky-400" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-bold text-white leading-tight">Team Members</h2>
                                <span className="text-sm text-slate-500 font-medium">{teamMembers.length} members</span>
                            </div>
                        </div>
                        {/* Mobile expansion indicator */}
                        <div className="sm:hidden text-slate-500">
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
                                        className="w-9 h-9 border-2 border-slate-900"
                                        style={{ zIndex: 6 - i }}
                                    >
                                        <AvatarImage src={m.picture} alt={m.employeeName} />
                                        <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
                                            {m.employeeName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                                {teamMembers.length > 6 && (
                                    <Avatar className="w-9 h-9 border-2 border-slate-900 z-0">
                                        <AvatarFallback className="bg-slate-800 text-slate-400 text-xs font-medium">
                                            +{teamMembers.length - 6}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>

                            {/* Status dots */}
                            <div className="hidden md:flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5" title="Active">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    {activeCount}
                                </span>
                                {inactiveCount > 0 && (
                                    <span className="flex items-center gap-1.5" title="Inactive">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                        {inactiveCount}
                                    </span>
                                )}
                                {resignedCount > 0 && (
                                    <span className="flex items-center gap-1.5" title="Resigned">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                        {resignedCount}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Desktop expansion indicator */}
                        <div className="hidden sm:block text-slate-500 group-hover:text-slate-300 transition-colors">
                            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="px-6 py-5 border-t border-slate-800 bg-slate-900/50">
                        {/* Mobile Status Dots (visible only when expanded on mobile) */}
                        <div className="flex md:hidden items-center gap-4 text-sm text-slate-400 mb-4 pb-4 border-b border-slate-800">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                <span className="text-slate-300">Active</span>
                                <span className="ml-1 px-1.5 bg-slate-800 rounded">{activeCount}</span>
                            </span>
                            {inactiveCount > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                    <span className="text-slate-300">Inactive</span>
                                    <span className="ml-1 px-1.5 bg-slate-800 rounded">{inactiveCount}</span>
                                </span>
                            )}
                            {resignedCount > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                    <span className="text-slate-300">Resigned</span>
                                    <span className="ml-1 px-1.5 bg-slate-800 rounded">{resignedCount}</span>
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.employeeId}
                                    className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 hover:bg-slate-800/70 transition-colors"
                                >
                                    <Avatar className="w-10 h-10 border border-slate-700/50 relative">
                                        <AvatarImage src={member.picture} alt={member.employeeName} />
                                        <AvatarFallback className="bg-slate-700 text-slate-300">
                                            {member.employeeName?.charAt(0)}
                                        </AvatarFallback>
                                        
                                    </Avatar>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-slate-200 truncate">{member.employeeName}</p>
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                                                member.employeeStatus === 1 ? 'bg-emerald-400' :
                                                member.employeeStatus === 2 ? 'bg-amber-400' : 'bg-rose-400'
                                            }`} title={
                                                member.employeeStatus === 1 ? 'Active' :
                                                member.employeeStatus === 2 ? 'Inactive' : 'Resigned'
                                            } />
                                        </div>
                                        <p className="text-xs text-slate-500 truncate mt-0.5" title={member.positionName}>
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
