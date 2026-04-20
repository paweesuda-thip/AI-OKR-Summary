import type {
  OkrDataRaw,
  OkrObjectiveDetailRaw,
  OkrDetailRaw,
  KrDetail,
  SubObjective,
  Objective,
  PersonObjective,
  PersonSubObjective,
  ContributorSum,
  ContributorSumObj,
  TeamSummary,
  DashboardData,
} from '@/lib/types/okr';

// ─── Mapping ───────────────────────────────────────────────────────────────────

export function mapObjective(item: OkrDataRaw): Objective {
  const progress = item.progress ?? 0;

  const subObjectives: SubObjective[] = (item.objectiveDetails || []).map(
    (sub: OkrObjectiveDetailRaw) => {
      const subProgress = sub.progress ?? 0;

      const details: KrDetail[] = (sub.details || []).map(
        (d: OkrDetailRaw) => {
          const pointCurrent = d.pointCurrent ?? 0;
          const pointOKR = d.pointOKR ?? 0;
          const krProgress =
            pointOKR > 0 ? Math.round((pointCurrent / pointOKR) * 100) : 0;

          return {
            fullName: d.fullName ?? d.fullName_EN ?? '',
            pictureURL: d.pictureUrl ?? '',
            krTitle: d.title ?? '',
            pointCurrent,
            pointOKR,
            krProgress,
            isDone: pointOKR > 0 && pointCurrent >= 100,
          };
        },
      );

      return {
        objectiveId: sub.objectiveId,
        objectiveOwnerType: sub.objectiveOwnerType,
        ownerTeam: sub.ownerTeam,
        title: sub.title,
        title_EN: sub.title_EN,
        progress: subProgress,
        progressUpdate: sub.progressUpdate ?? 0,
        status:
          subProgress >= 70
            ? 'On Track'
            : subProgress >= 40
              ? 'At Risk'
              : 'Behind',
        details,
      };
    },
  );

  const allDetails: KrDetail[] = subObjectives.flatMap((sub) => sub.details);

  return {
    objectiveId: item.objectiveId ?? 0,
    objectiveOwnerType: item.objectiveOwnerType ?? 1,
    objectiveType: item.objectiveType ?? 1,
    referenceObjectiveId: item.referenceObjectiveId ?? 0,
    objectiveName: (item.title ?? '').trim(),
    objectiveName_EN: (item.title_EN ?? '').trim(),
    ownerTeam: item.ownerTeam ?? '',
    progress,
    status:
      progress >= 70 ? 'On Track' : progress >= 40 ? 'At Risk' : 'Behind',
    impactLevel:
      progress >= 80 ? 'high' : progress >= 60 ? 'medium' : 'low',
    subObjectives,
    details: allDetails,
  };
}

// ─── Summary ───────────────────────────────────────────────────────────────────

export function calculateSummary(objectives: Objective[]): TeamSummary {
  const total = objectives.length;
  const completed = objectives.filter((o) => o.progress === 100).length;
  const avgProgress =
    total > 0
      ? Math.round(
          (objectives.reduce((s, o) => s + o.progress, 0) / total) * 10,
        ) / 10
      : 0;

  const allDetails = objectives.flatMap((o) => o.details);
  const totalKRs = allDetails.length;
  const completedKRs = allDetails.filter((d) => d.isDone).length;
  const uniqueNames = new Set(
    allDetails.map((d) => d.fullName).filter(Boolean),
  );

  return {
    totalObjectives: total,
    completedObjectives: completed,
    avgObjectiveProgress: avgProgress,
    totalKRs,
    completedKRs,
    totalContributors: uniqueNames.size,
    objectiveCompletionRate:
      total > 0 ? Math.round((completed / total) * 100) : 0,
    krCompletionRate:
      totalKRs > 0 ? Math.round((completedKRs / totalKRs) * 100) : 0,
    onTrackCount: objectives.filter((o) => o.status === 'On Track').length,
    atRiskCount: objectives.filter((o) => o.status === 'At Risk').length,
    behindCount: objectives.filter((o) => o.status === 'Behind').length,
  };
}

// ─── Contributors ──────────────────────────────────────────────────────────────

export function aggregateContributors(
  objectives: Objective[],
): ContributorSum[] {
  const map = new Map<string, ContributorSum>();

  objectives.forEach((obj) => {
    obj.details.forEach((d) => {
      if (!d.fullName) return;
      if (!map.has(d.fullName)) {
        map.set(d.fullName, {
          fullName: d.fullName,
          pictureURL: d.pictureURL,
          totalPointCurrent: 0,
          totalPointOKR: 0,
          krCount: 0,
          checkInCount: 0,
          objectives: [],
          avgObjectiveProgress: 0,
        });
      }
      const c = map.get(d.fullName)!;
      c.totalPointCurrent += d.pointCurrent;
      c.totalPointOKR += d.pointOKR;
      c.krCount++;
      if (d.pointCurrent > 0) c.checkInCount++;
      if (
        !c.objectives.find(
          (o: ContributorSumObj) => o.objectiveId === obj.objectiveId,
        )
      ) {
        c.objectives.push({
          objectiveId: obj.objectiveId,
          objectiveName: obj.objectiveName,
          progress: obj.progress,
          status: obj.status,
        });
      }
    });
  });

  const list: ContributorSum[] = [...map.values()].map(
    (c: ContributorSum) => ({
      ...c,
      avgObjectiveProgress:
        c.objectives.length > 0
          ? Math.round(
              c.objectives.reduce(
                (s: number, o: ContributorSumObj) => s + o.progress,
                0,
              ) / c.objectives.length,
            )
          : 0,
    }),
  );

  // Sort by avgObjectiveProgress DESC, then checkInCount DESC as tiebreaker
  list.sort((a, b) => {
    if (b.avgObjectiveProgress !== a.avgObjectiveProgress) {
      return b.avgObjectiveProgress - a.avgObjectiveProgress;
    }
    return b.checkInCount - a.checkInCount;
  });

  return list;
}

// ─── Transform Raw → DashboardData ─────────────────────────────────────────────

export function transformDashboardData(raw: OkrDataRaw[]): DashboardData {
  const objectives = raw.map(mapObjective);
  const teamSummary = calculateSummary(objectives);
  const contributors = aggregateContributors(objectives);
  const atRiskObjectives = objectives.filter((o) => o.progress < 70);
  const noCheckInEmployees = contributors.filter((c) => c.checkInCount === 0);

  return {
    teamSummary,
    objectives,
    contributors,
    atRiskObjectives,
    noCheckInEmployees,
  };
}

// ─── Per-Person Mapping ────────────────────────────────────────────────────────

/**
 * Transforms a team-level Objective into a person-specific view by:
 *   1. Keeping only sub-OKRs where `personName` owns at least one KR.
 *   2. Computing raw `personProgress` per sub-OKR: avg(details[].pointOKR).
 *   3. Computing `personProgressCapped` = min(personProgress, sub.progress) to
 *      account for 0% KRs that backend includes in sub.progress but hides from
 *      details[].
 *   4. Main `personProgress` = avg(subObjectives[].personProgressCapped).
 *
 * Returns `null` when the person has no KRs anywhere in this objective.
 *
 * See OKR_API_DOCS.md §5 for full rationale.
 *
 * Display numbers should use `Math.floor()` (source system truncates).
 */
export function mapObjectiveForPerson(
  obj: Objective,
  personName: string,
): PersonObjective | null {
  const target = personName.trim();
  if (!target) return null;

  const personSubs: PersonSubObjective[] = obj.subObjectives
    .map((sub): PersonSubObjective | null => {
      const personDetails = sub.details.filter(
        (d) => d.fullName.trim() === target,
      );
      if (personDetails.length === 0) return null;

      const personProgress =
        personDetails.reduce((acc, d) => acc + (d.pointOKR ?? 0), 0) /
        personDetails.length;
      const personProgressCapped = Math.min(personProgress, sub.progress);

      return {
        ...sub,
        details: personDetails,
        personProgress,
        personProgressCapped,
      };
    })
    .filter((s): s is PersonSubObjective => s !== null);

  if (personSubs.length === 0) return null;

  const personProgress =
    personSubs.reduce((acc, s) => acc + s.personProgressCapped, 0) /
    personSubs.length;

  return {
    ...obj,
    subObjectives: personSubs,
    personProgress,
  };
}
