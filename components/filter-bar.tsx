"use client";

import { Folder, Calendar, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface FilterOption {
    id: string;
    name: string;
    avatar?: string;
}

interface FilterBarProps {
    sets: FilterOption[];
    periods: FilterOption[];
    employees: FilterOption[];
    selectedSet: FilterOption | null;
    selectedPeriod: FilterOption | null;
    selectedEmployeeIds: string[];
    onSetChange: (set: FilterOption | null) => void;
    onPeriodChange: (period: FilterOption | null) => void;
    onEmployeeChange: (updater: (prev: string[]) => string[]) => void;
}

export default function FilterBar({
    sets, periods, employees,
    selectedSet, selectedPeriod, selectedEmployeeIds,
    onSetChange, onPeriodChange, onEmployeeChange,
}: FilterBarProps) {

    const toggleEmployee = (id: string) => {
        onEmployeeChange(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const selectAllEmployees = () => {
        onEmployeeChange(() => []);
    };

    const empLabel = selectedEmployeeIds.length === 0
        ? 'ทีมทั้งหมด'
        : `${selectedEmployeeIds.length} คนที่เลือก`;

    return (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-sm font-semibold text-muted-foreground mr-2 hidden sm:inline-block">Filter by:</span>
            {/* OKR Set Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger 
                    render={<Button variant="ghost" className="hover:bg-muted/50 text-foreground h-10 px-4 w-full sm:w-auto justify-between transition-all rounded-full border border-border/30" />}
                >
                    <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-primary" />
                        <span className="truncate max-w-[120px] font-medium">{selectedSet?.name || 'เลือก OKR Set'}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[220px] bg-background/90 backdrop-blur-xl border-border/50 text-foreground shadow-md rounded-xl">
                    {sets.map(s => (
                        <DropdownMenuItem 
                            key={s.id} 
                            onClick={() => onSetChange(s)}
                            className={`cursor-pointer focus:bg-muted/50 focus:text-foreground ${selectedSet?.id === s.id ? 'text-primary font-bold bg-muted/30' : 'font-medium'}`}
                        >
                            {s.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Period Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger 
                    render={<Button variant="ghost" className="hover:bg-muted/50 text-foreground h-10 px-4 w-full sm:w-auto justify-between transition-all rounded-full border border-border/30" />}
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                        <span className="truncate font-medium">{selectedPeriod?.name || 'เลือกช่วงเวลา'}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px] bg-background/90 backdrop-blur-xl border-border/50 text-foreground shadow-md rounded-xl">
                    {periods.map(p => (
                        <DropdownMenuItem 
                            key={p.id} 
                            onClick={() => onPeriodChange(p)}
                            className={`cursor-pointer focus:bg-muted/50 focus:text-foreground ${selectedPeriod?.id === p.id ? 'text-emerald-600 dark:text-emerald-500 font-bold bg-muted/30' : 'font-medium'}`}
                        >
                            {p.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Employees Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger 
                    render={<Button variant="ghost" className="hover:bg-muted/50 text-foreground h-10 px-4 w-full sm:w-auto justify-between transition-all rounded-full border border-border/30" />}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        <span className="font-medium">{empLabel}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[240px] bg-background/90 backdrop-blur-xl border-border/50 text-foreground shadow-md max-h-[400px] overflow-y-auto rounded-xl">
                    <DropdownMenuCheckboxItem
                        checked={selectedEmployeeIds.length === 0}
                        onCheckedChange={() => selectAllEmployees()}
                        className="cursor-pointer focus:bg-muted/50 focus:text-foreground"
                    >
                        <span className={selectedEmployeeIds.length === 0 ? 'text-amber-600 dark:text-amber-500 font-bold' : 'font-medium'}>ทีมทั้งหมด</span>
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator className="bg-border/50" />
                    
                    {employees.map(emp => (
                        <DropdownMenuCheckboxItem
                            key={emp.id}
                            checked={selectedEmployeeIds.includes(emp.id)}
                            onCheckedChange={() => toggleEmployee(emp.id)}
                            className="cursor-pointer focus:bg-muted/50 focus:text-foreground font-medium"
                        >
                            <div className="flex items-center gap-2">
                                <span className="bg-muted/50 w-6 h-6 flex items-center justify-center rounded-full text-xs text-muted-foreground">{emp.avatar}</span>
                                <span className="truncate max-w-[150px]">{emp.name}</span>
                            </div>
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
