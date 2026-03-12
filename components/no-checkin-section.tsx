import { UserX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ContributorSum } from "@/lib/types/okr";

export default function NoCheckInSection({ noCheckInEmployees }: { noCheckInEmployees: ContributorSum[] }) {
    const employees = noCheckInEmployees || [];

    if (employees.length === 0) return null;

    return (
        <Card className="border-border/40 shadow-sm overflow-hidden mt-8 bg-card/40 backdrop-blur-xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 bg-muted/20 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center shadow-inner">
                        <UserX className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-foreground tracking-tight">No Check-in</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Employees who have not recorded any KR progress yet</p>
                    </div>
                </div>
                <Badge variant="outline" className="bg-background/40 backdrop-blur-md text-foreground border-border/50 px-3 py-1 text-sm shadow-sm font-semibold">
                    {employees.length} employee{employees.length !== 1 ? 's' : ''}
                </Badge>
            </CardHeader>

            <CardContent className="p-6 bg-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {employees.map((person) => (
                        <div
                            key={person.fullName}
                            className="flex items-center gap-4 p-4 bg-background/40 backdrop-blur-md border border-border/50 rounded-xl transition-all hover:shadow-md hover:bg-background/60 shadow-sm hover:border-muted-foreground/30"
                        >
                            <Avatar className="w-10 h-10 border border-border/40 opacity-80 shadow-sm">
                                <AvatarImage src={person.pictureURL} alt={person.fullName} />
                                <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                                    {person.fullName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-semibold text-foreground truncate">{person.fullName}</p>
                                <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                                    {person.krCount} KR{person.krCount !== 1 ? 's' : ''} · {person.objectives?.length || 0} objective{(person.objectives?.length || 0) !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <Badge variant="secondary" className="bg-background/50 text-muted-foreground border-border/40 font-semibold shrink-0 shadow-sm">
                                0 check-ins
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
