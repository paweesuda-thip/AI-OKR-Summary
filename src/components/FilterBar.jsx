import React, { useState, useRef, useEffect } from 'react';

const FilterBar = ({
    sets, periods, employees,
    selectedSet, selectedPeriod, selectedEmployeeIds,
    onSetChange, onPeriodChange, onEmployeeChange,
}) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenDropdown(null); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleEmployee = (id) => {
        onEmployeeChange(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const empLabel = selectedEmployeeIds.length === 0
        ? 'ทีมทั้งหมด'
        : `${selectedEmployeeIds.length} คนที่เลือก`;

    return (
        <div ref={ref} className="flex items-center gap-2">

            {/* OKR Set */}
            <div className="relative">
                <button
                    onClick={() => setOpenDropdown(openDropdown === 'set' ? null : 'set')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 hover:border-indigo-500 min-w-[160px]"
                >
                    <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="truncate">{selectedSet?.name || 'เลือก OKR Set'}</span>
                    <svg className="w-3 h-3 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {openDropdown === 'set' && (
                    <div className="absolute top-full mt-1 left-0 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-30 min-w-[220px] py-1">
                        {sets.map(s => (
                            <button
                                key={s.id}
                                onClick={() => { onSetChange(s); setOpenDropdown(null); }}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 ${selectedSet?.id === s.id ? 'text-indigo-400' : 'text-slate-300'}`}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Period */}
            <div className="relative">
                <button
                    onClick={() => setOpenDropdown(openDropdown === 'period' ? null : 'period')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 hover:border-indigo-500 min-w-[130px]"
                >
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{selectedPeriod?.name || 'เลือกช่วงเวลา'}</span>
                    <svg className="w-3 h-3 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {openDropdown === 'period' && (
                    <div className="absolute top-full mt-1 left-0 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-30 min-w-[160px] py-1">
                        {periods.map(p => (
                            <button
                                key={p.id}
                                onClick={() => { onPeriodChange(p); setOpenDropdown(null); }}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 ${selectedPeriod?.id === p.id ? 'text-emerald-400' : 'text-slate-300'}`}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Employees */}
            <div className="relative">
                <button
                    onClick={() => setOpenDropdown(openDropdown === 'emp' ? null : 'emp')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 hover:border-indigo-500 min-w-[130px]"
                >
                    <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{empLabel}</span>
                    <svg className="w-3 h-3 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {openDropdown === 'emp' && (
                    <div className="absolute top-full mt-1 right-0 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-30 min-w-[200px] py-1">
                        <button
                            onClick={() => onEmployeeChange([])}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 flex items-center gap-2 ${selectedEmployeeIds.length === 0 ? 'text-amber-400' : 'text-slate-300'}`}
                        >
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${selectedEmployeeIds.length === 0 ? 'bg-amber-400 border-amber-400' : 'border-slate-500'}`}>
                                {selectedEmployeeIds.length === 0 && <svg className="w-2.5 h-2.5 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </span>
                            ทีมทั้งหมด
                        </button>
                        <div className="border-t border-slate-700 my-1" />
                        {employees.map(emp => (
                            <button
                                key={emp.id}
                                onClick={() => toggleEmployee(emp.id)}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 flex items-center gap-2 text-slate-300"
                            >
                                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${selectedEmployeeIds.includes(emp.id) ? 'bg-amber-400 border-amber-400' : 'border-slate-500'}`}>
                                    {selectedEmployeeIds.includes(emp.id) && <svg className="w-2.5 h-2.5 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                </span>
                                <span className="text-base leading-none">{emp.avatar}</span>
                                <span className="truncate">{emp.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterBar;
