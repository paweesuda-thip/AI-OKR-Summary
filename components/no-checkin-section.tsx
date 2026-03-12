import { UserX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContributorSum } from "@/lib/types/okr";

export default function NoCheckInSection({ noCheckInEmployees }: { noCheckInEmployees: ContributorSum[] }) {
    const employees = noCheckInEmployees || [];

    if (employees.length === 0) return null;

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden mt-8">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 bg-slate-900/50 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-500/15 border border-slate-500/30 flex items-center justify-center">
                        <UserX className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-white">No Check-in</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">Employees who have not recorded any KR progress yet</p>
                    </div>
                </div>
                <Badge variant="outline" className="bg-slate-500/15 text-slate-300 border-slate-500/25 px-3 py-1 text-sm">
                    {employees.length} employee{employees.length !== 1 ? 's' : ''}
                </Badge>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {employees.map((person) => (
                        <div
                            key={person.fullName}
                            className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl transition-colors hover:bg-slate-800/60"
                        >
                            <Avatar className="w-10 h-10 border border-slate-700/50 opacity-70">
                                <AvatarImage src={person.pictureURL} alt={person.fullName} />
                                <AvatarFallback className="bg-slate-700 text-slate-400 font-bold">
                                    {person.fullName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-medium text-slate-300 truncate">{person.fullName}</p>
                                <p className="text-sm text-slate-600 mt-0.5">
                                    {person.krCount} KR{person.krCount !== 1 ? 's' : ''} · {person.objectives?.length || 0} objective{(person.objectives?.length || 0) !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <Badge variant="secondary" className="bg-slate-700/60 text-slate-400 border-slate-600/40 font-medium shrink-0">
                                0 check-ins
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
