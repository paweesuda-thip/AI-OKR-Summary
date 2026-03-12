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

interface FilterBarProps {
    sets: any[];
    periods: any[];
    employees: any[];
    selectedSet: any;
    selectedPeriod: any;
    selectedEmployeeIds: string[];
    onSetChange: (set: any) => void;
    onPeriodChange: (period: any) => void;
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
            {/* OKR Set Dropdown */}
            <DropdownMenu>
                {/* @ts-expect-error asChild type issue */}
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100 h-9 px-3 w-full sm:w-auto min-w-[160px] justify-between">
                        <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4 text-indigo-400" />
                            <span className="truncate max-w-[120px]">{selectedSet?.name || 'เลือก OKR Set'}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 opacity-50 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[220px] bg-slate-800 border-slate-700 text-slate-300">
                    {sets.map(s => (
                        <DropdownMenuItem 
                            key={s.id} 
                            onClick={() => onSetChange(s)}
                            className={`cursor-pointer focus:bg-slate-700 focus:text-white ${selectedSet?.id === s.id ? 'text-indigo-400 font-medium bg-slate-700/50' : ''}`}
                        >
                            {s.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Period Dropdown */}
            <DropdownMenu>
                {/* @ts-expect-error asChild type issue */}
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100 h-9 px-3 w-full sm:w-auto min-w-[140px] justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <span className="truncate">{selectedPeriod?.name || 'เลือกช่วงเวลา'}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 opacity-50 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px] bg-slate-800 border-slate-700 text-slate-300">
                    {periods.map(p => (
                        <DropdownMenuItem 
                            key={p.id} 
                            onClick={() => onPeriodChange(p)}
                            className={`cursor-pointer focus:bg-slate-700 focus:text-white ${selectedPeriod?.id === p.id ? 'text-emerald-400 font-medium bg-slate-700/50' : ''}`}
                        >
                            {p.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Employees Dropdown */}
            <DropdownMenu>
                {/* @ts-expect-error asChild type issue */}
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100 h-9 px-3 w-full sm:w-auto min-w-[140px] justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-400" />
                            <span>{empLabel}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 opacity-50 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[240px] bg-slate-800 border-slate-700 text-slate-300 max-h-[400px] overflow-y-auto">
                    <DropdownMenuCheckboxItem
                        checked={selectedEmployeeIds.length === 0}
                        onCheckedChange={() => selectAllEmployees()}
                        className="cursor-pointer focus:bg-slate-700 focus:text-white"
                    >
                        <span className={selectedEmployeeIds.length === 0 ? 'text-amber-400 font-medium' : ''}>ทีมทั้งหมด</span>
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator className="bg-slate-700" />
                    
                    {employees.map(emp => (
                        <DropdownMenuCheckboxItem
                            key={emp.id}
                            checked={selectedEmployeeIds.includes(emp.id)}
                            onCheckedChange={() => toggleEmployee(emp.id)}
                            className="cursor-pointer focus:bg-slate-700 focus:text-white"
                        >
                            <div className="flex items-center gap-2">
                                <span>{emp.avatar}</span>
                                <span className="truncate max-w-[160px]">{emp.name}</span>
                            </div>
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
