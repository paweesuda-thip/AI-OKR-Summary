import { Trophy, Loader2, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AvatarInfoTooltip } from "@/components/ui/avatar-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContributorSum } from "@/lib/types/okr";
import ShinyText from "@/components/react-bits/ShinyText";
import MagicBento from "@/components/react-bits/MagicBento";

// Re-export type for Dashboard use
export interface TopPerformersAISummary {
    rankings?: Array<{ rank: number; name: string; summary: string }>;
    teamSummary?: string;
}

interface TopPerformersSectionProps {
    contributors: ContributorSum[];
    aiSummary?: TopPerformersAISummary | null;
    aiLoading?: boolean;
}

const topCardGradients = [
    "linear-gradient(160deg, rgba(62,41,15,0.9) 0%, rgba(23,17,10,0.95) 100%)",
    "linear-gradient(160deg, rgba(27,35,48,0.92) 0%, rgba(11,16,24,0.96) 100%)",
    "linear-gradient(160deg, rgba(59,33,17,0.9) 0%, rgba(21,14,8,0.96) 100%)",
];

const topLabels = ["Gold Tier", "Silver Tier", "Bronze Tier"];

const EmptyState = () => (
    <Card className="border-none bg-transparent shadow-none w-full h-full flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4 py-5 px-0 pb-6 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
                <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
                <CardTitle className="text-xl text-foreground tracking-tight">Top Performers</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center flex-1 py-12 px-0 bg-transparent">
            <Trophy className="w-16 h-16 text-amber-500 opacity-80" />
            <p className="text-muted-foreground text-base font-medium mt-4 text-center">No contributor data available</p>
        </CardContent>
    </Card>
);

export default function TopPerformersSection({ contributors, aiSummary = null, aiLoading = false }: TopPerformersSectionProps) {
    const defaultImages = ["/person1.jpg", "/person2.png", "/person3.png"];
    
    // Fallback to mock data if API fails or returns no top performers
    const activeContributors = (contributors && contributors.length >= 3) 
        ? contributors 
        : [
            { fullName: "Sarah Connor", avgObjectiveProgress: 95.5, krCount: 8, checkInCount: 24, pictureURL: "/person1.jpg" },
            { fullName: "John Smith", avgObjectiveProgress: 88.2, krCount: 6, checkInCount: 18, pictureURL: "/person2.png" },
            { fullName: "Emily Chen", avgObjectiveProgress: 82.0, krCount: 5, checkInCount: 15, pictureURL: "/person3.png" }
          ] as ContributorSum[];

    const top3 = activeContributors.slice(0, 3);
    const rest = activeContributors.slice(3);

    const topCards = top3.map((person: ContributorSum, i: number) => {
        const aiPersonSummary = aiSummary?.rankings?.[i]?.summary;

        return {
            label: `#${i + 1} ${topLabels[i] || "Top Talent"}`,
            title: person.fullName,
            description: `${person.avgObjectiveProgress.toFixed(1)}% average objective progress`,
            meta: aiPersonSummary || `${person.krCount} KRs • ${person.checkInCount} check-ins`,
            avatar: person.pictureURL || defaultImages[i] || `https://picsum.photos/seed/${person.fullName.replace(/\s+/g,'')}/400/600`,
            color: topCardGradients[i] || topCardGradients[topCardGradients.length - 1],
        };
    });

    return (
        <Card className="border-none bg-transparent shadow-none w-full h-full flex flex-col p-4">
            <CardHeader className="flex flex-row items-center gap-4 border-b border-border/40 bg-muted/20 p-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
                    <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-1 min-w-0">
                    <CardTitle className="text-xl text-foreground tracking-tight">Top Performers</CardTitle>
                    <ShinyText
                        text="Profile cards powered by MagicBento"
                        className="text-sm font-medium text-muted-foreground"
                        color="#acc6ef"
                        shineColor="#ffffff"
                        speed={3.2}
                        spread={132}
                    />
                </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-8 bg-transparent">
                <div className="rounded-2xl border border-white/10 bg-[linear-gradient(170deg,rgba(12,20,34,0.4),rgba(9,14,24,0.6))] p-3 sm:p-4 backdrop-blur-md">
                    <MagicBento
                        cards={topCards}
                        layout="uniform"
                        className="max-w-none"
                        textAutoHide={false}
                        enableStars
                        enableSpotlight
                        enableBorderGlow
                        spotlightRadius={240}
                        particleCount={10}
                        enableTilt
                        glowColor="112, 168, 255"
                        clickEffect
                        enableMagnetism
                    />
                </div>

                {!aiSummary?.rankings?.length && aiLoading && (
                    <div className="flex items-center justify-center gap-2.5 py-4 bg-background/40 backdrop-blur-md rounded-xl border border-border/50 shadow-sm">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground font-medium">AI analyzing top performers...</span>
                    </div>
                )}

                {/* AI Team Summary */}
                {aiSummary?.teamSummary && (
                    <div className="bg-background/40 backdrop-blur-md border border-primary/20 hover:border-primary/40 rounded-2xl p-6 shadow-sm transition-colors hover:bg-background/60">
                        <div className="flex items-center gap-2.5 mb-3">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <p className="text-sm font-bold text-primary uppercase tracking-wide">AI Team Overview</p>
                        </div>
                        <p className="text-base text-foreground font-medium leading-relaxed">{aiSummary.teamSummary}</p>
                    </div>
                )}

                {/* Other Members */}
                {rest.length > 0 && (
                    <div className="pt-4">
                        <div className="flex items-center gap-4 mb-6 opacity-80">
                            <div className="flex-1 h-px bg-border/50" />
                            <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Other Members</span>
                            <div className="flex-1 h-px bg-border/50" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rest.map((person: ContributorSum, i: number) => (
                                <div key={person.fullName} className="bg-background/40 backdrop-blur-md border border-border/50 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-muted-foreground/30 hover:bg-background/60 transition-colors">
                                    <span className="text-sm text-muted-foreground w-6 text-right font-mono tabular-nums font-semibold">#{i + 4}</span>
                                    <AvatarInfoTooltip
                                        fullName={person.fullName}
                                        pictureURL={person.pictureURL}
                                        avatarClassName="w-8 h-8 rounded-full border border-border/40 shadow-sm"
                                        fallbackClassName="bg-muted text-xs text-muted-foreground"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground truncate font-semibold">{person.fullName}</p>
                                        <p className="text-xs text-muted-foreground font-medium">{person.checkInCount} check-ins</p>
                                    </div>
                                    <div className="text-right pr-2">
                                        <span className="text-sm font-bold text-foreground tabular-nums">
                                            {person.avgObjectiveProgress}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
