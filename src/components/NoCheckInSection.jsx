const NoCheckInSection = ({ noCheckInEmployees }) => {
    const employees = noCheckInEmployees || [];

    if (employees.length === 0) return null;

    return (
        <div className="section-panel">
            <div className="section-header">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-500/15 border border-slate-500/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">No Check-in</h2>
                        <p className="text-base text-slate-500 mt-1">Employees who have not recorded any KR progress yet</p>
                    </div>
                </div>
                <span className="text-base px-4 py-2 bg-slate-500/15 text-slate-300 border border-slate-500/25 rounded-full font-semibold">
                    {employees.length} employee{employees.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {employees.map((person) => (
                        <div
                            key={person.fullName}
                            className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl"
                        >
                            {person.pictureURL ? (
                                <img
                                    src={person.pictureURL}
                                    alt={person.fullName}
                                    className="w-10 h-10 rounded-full object-cover bg-slate-700 shrink-0 opacity-60"
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-700 shrink-0 flex items-center justify-center text-slate-500 font-bold">
                                    {person.fullName.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-medium text-slate-300 truncate">{person.fullName}</p>
                                <p className="text-sm text-slate-600 mt-0.5">
                                    {person.krCount} KR{person.krCount !== 1 ? 's' : ''} · {person.objectives.length} objective{person.objectives.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <span className="text-xs px-2.5 py-1 bg-slate-700/60 text-slate-500 border border-slate-600/40 rounded-lg font-medium shrink-0">
                                0 check-ins
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NoCheckInSection;
