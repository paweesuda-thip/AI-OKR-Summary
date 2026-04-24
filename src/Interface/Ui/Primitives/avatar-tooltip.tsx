import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider
} from "@/src/Interface/Ui/Primitives/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/Interface/Ui/Primitives/avatar";

export interface AvatarMember {
    fullName?: string;
    pictureURL?: string;
}

export const getAvatarInitials = (fullName?: string) => {
    if (!fullName) return "NA";

    const words = fullName.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "NA";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
};

export const AvatarInfoTooltip = ({
    fullName,
    pictureURL,
    avatarClassName,
    fallbackClassName,
    style,
}: {
    fullName?: string;
    pictureURL?: string;
    avatarClassName: string;
    fallbackClassName?: string;
    style?: React.CSSProperties;
}) => {
    const displayName = fullName || "Unknown user";

    return (
        <Tooltip>
            <TooltipTrigger>
                <Avatar className={avatarClassName} style={style}>
                    <AvatarImage src={pictureURL} alt={displayName} />
                    <AvatarFallback className={fallbackClassName}>{getAvatarInitials(displayName)}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                className="border border-border/30 bg-background/95 text-foreground shadow-xl backdrop-blur-md"
            >
                <div className="flex min-w-[160px] items-center gap-2">
                    <Avatar className="h-8 w-8 border border-border/40">
                        <AvatarImage src={pictureURL} alt={displayName} />
                        <AvatarFallback className="bg-muted text-[10px]">{getAvatarInitials(displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs font-medium">{displayName}</span>
                </div>
            </TooltipContent>
        </Tooltip>
    );
};

export const AvatarOverflowTooltip = ({
    members,
    hiddenCount,
    label,
    triggerClassName,
}: {
    members: AvatarMember[];
    hiddenCount: number;
    label: string;
    triggerClassName: string;
}) => {
    return (
        <Tooltip>
            <TooltipTrigger>
                <div className={triggerClassName}>+{hiddenCount}</div>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                align="end"
                className="w-[260px] block border border-border/30 bg-background/95 p-3 text-foreground shadow-xl backdrop-blur-md"
            >
                <div className="space-y-2 w-full">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {label} ({members.length})
                    </p>
                    <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1 w-full">
                        {members.map((member, idx) => {
                            const displayName = member.fullName || "Unknown user";
                            return (
                                <div
                                    key={`${displayName}-${idx}`}
                                    className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5"
                                >
                                    <Avatar className="h-6 w-6 border border-border/30">
                                        <AvatarImage src={member.pictureURL} alt={displayName} />
                                        <AvatarFallback className="bg-muted text-[9px]">
                                            {getAvatarInitials(displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate text-xs text-foreground">{displayName}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </TooltipContent>
        </Tooltip>
    );
};
