import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Allow responses up to 5 minutes (Anthropic can be slow on long Thai JSON outputs)
export const maxDuration = 300;

const tryParseJson = (raw: string): any | null => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Escape raw control chars (newlines, CR, tabs) that appear *inside* JSON string
// literals. Claude frequently emits real line breaks inside string values because
// we ask for readable multi-line bullets — which is invalid per JSON spec and
// makes JSON.parse throw. We walk the text tracking whether we're inside a
// double-quoted string (respecting backslash escapes) and replace offending
// chars with their escaped form.
const escapeControlCharsInStrings = (input: string): string => {
  let out = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inString) {
      if (escaped) {
        out += ch;
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        out += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        out += ch;
        inString = false;
        continue;
      }
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') { out += '\\r'; continue; }
      if (ch === '\t') { out += '\\t'; continue; }
      out += ch;
    } else {
      out += ch;
      if (ch === '"') inString = true;
    }
  }
  return out;
};

// Best-effort repair for truncated JSON: close any open string, then close any
// open arrays/objects in the right order. Still returns input unchanged if it
// can't confidently repair.
const repairTruncatedJson = (input: string): string => {
  let inString = false;
  let escaped = false;
  const stack: string[] = [];
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{' || ch === '[') stack.push(ch);
    else if (ch === '}' && stack[stack.length - 1] === '{') stack.pop();
    else if (ch === ']' && stack[stack.length - 1] === '[') stack.pop();
  }
  let repaired = input;
  // Drop a trailing comma inside unclosed container.
  repaired = repaired.replace(/,\s*$/, '');
  if (inString) repaired += '"';
  while (stack.length) {
    const opener = stack.pop();
    repaired += opener === '{' ? '}' : ']';
  }
  return repaired;
};

const parseModelResponse = (text: string): any | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const parseCandidates = new Set<string>([trimmed]);

  const fencedJsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedJsonMatch?.[1]) {
    parseCandidates.add(fencedJsonMatch[1].trim());
  }

  const firstObjectStart = trimmed.indexOf('{');
  const lastObjectEnd = trimmed.lastIndexOf('}');
  if (firstObjectStart !== -1 && lastObjectEnd > firstObjectStart) {
    parseCandidates.add(trimmed.slice(firstObjectStart, lastObjectEnd + 1));
  }

  // First pass: raw candidates.
  for (const candidate of parseCandidates) {
    const parsed = tryParseJson(candidate);
    if (parsed && typeof parsed === 'object') return parsed;
  }

  // Second pass: escape raw control chars inside string values.
  for (const candidate of parseCandidates) {
    const sanitized = escapeControlCharsInStrings(candidate);
    const parsed = tryParseJson(sanitized);
    if (parsed && typeof parsed === 'object') return parsed;
  }

  // Third pass: treat as truncated JSON — take from first '{' to end of text,
  // escape control chars, then close open containers.
  if (firstObjectStart !== -1) {
    const tail = trimmed.slice(firstObjectStart);
    const sanitized = escapeControlCharsInStrings(tail);
    const repaired = repairTruncatedJson(sanitized);
    const parsed = tryParseJson(repaired);
    if (parsed && typeof parsed === 'object') return parsed;
  }

  return null;
};

// Generate JSON via Anthropic with retry + parse recovery.
// Returns null if all attempts fail so the caller can degrade gracefully.
async function generateJsonWithRetry<T = any>(opts: {
  anthropic: ReturnType<typeof createAnthropic>;
  prompt: string;
  label: string;
  maxAttempts?: number;
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<T | null> {
  const {
    anthropic,
    prompt,
    label,
    maxAttempts = 3,
    maxOutputTokens = 4096,
    temperature = 0.4,
  } = opts;

  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { text } = await generateText({
        model: anthropic('claude-haiku-4-5'),
        prompt,
        temperature,
        maxOutputTokens,
      });
      const parsed = parseModelResponse(text);
      if (parsed) return parsed as T;
      lastErr = new Error(
        `parse_failed (${label}) attempt ${attempt} — len=${text.length}, head=${JSON.stringify(
          text.slice(0, 120),
        )}, tail=${JSON.stringify(text.slice(-120))}`,
      );
    } catch (err) {
      lastErr = err;
    }
    if (attempt < maxAttempts) {
      const backoff = 400 * Math.pow(2, attempt - 1) + Math.random() * 200;
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  console.error(`[compare] ${label} failed after ${maxAttempts} attempts`, lastErr);
  return null;
}

export async function POST(req: Request) {
  try {
    const { playerA, playerB, cycleLabelA, cycleLabelB } = await req.json();

    if (!playerA || !playerB) {
      return NextResponse.json({ error: 'Missing player data' }, { status: 400 });
    }

    const nameA = typeof playerA?.fullName === 'string' ? playerA.fullName.trim() : '';
    const nameB = typeof playerB?.fullName === 'string' ? playerB.fullName.trim() : '';
    const isSelfComparison = nameA !== '' && nameA === nameB;
    const labelA = typeof cycleLabelA === 'string' && cycleLabelA.trim() ? cycleLabelA.trim() : 'รอบ A';
    const labelB = typeof cycleLabelB === 'string' && cycleLabelB.trim() ? cycleLabelB.trim() : 'รอบ B';

    const trimPlayer = (p: any) => {
      return {
        name: p.fullName,
        checkIns: p.checkInCount,
        avgProgress: p.avgParticipantPercent ?? p.avgObjectiveProgress,
        topObjectives: p.topObjectives.map((obj: any) => ({
          name: obj.objectiveName,
          progress: obj.progress,
          tasks:
            obj.actualDetails
              ?.map((detail: any) => {
                const detailProgress = Math.round(detail?.progress || 0);
                const krList =
                  detail?.details
                    ?.map((kr: any) => `${kr.krTitle} (${Math.round(kr.krProgress || 0)}%)`)
                    .join(', ') || 'no KR';
                return `${detail?.title || 'Objective detail'} [${detailProgress}%]: ${krList}`;
              })
              .join(' | ') || 'No specific breakdown',
        })),
      };
    };

    const dataA = trimPlayer(playerA);
    const dataB = trimPlayer(playerB);

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    const maxRounds = Math.max(dataA.topObjectives.length, dataB.topObjectives.length);

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AI_UNAVAILABLE',
          message:
            'Anthropic API key is not configured. Set ANTHROPIC_API_KEY (or NEXT_PUBLIC_ANTHROPIC_API_KEY) so eval copy is generated by the model only.',
        },
        { status: 503 },
      );
    }

    const calcScore = (p: any): number => {
      let score = p.avgProgress || 0;
      score += (p.checkIns || 0) * 1.5;
      score += p.topObjectives.length > 1 ? p.topObjectives.length * 2 : 0;
      return Math.max(0, Math.round(score));
    };

    let p1Score = calcScore(dataA);
    let p2Score = calcScore(dataB);

    if (p1Score === p2Score) {
      if (dataA.checkIns > dataB.checkIns) p1Score++;
      else if (dataB.checkIns > dataA.checkIns) p2Score++;
      else p1Score++;
    }

    const exactWinner = p1Score > p2Score ? dataA.name : dataB.name;

    const matchedRounds = Array.from({ length: maxRounds }).map((_, i) => ({
      roundNumber: i + 1,
      p1Data: dataA.topObjectives[i]
        ? `${dataA.topObjectives[i].name} (Tasks: ${dataA.topObjectives[i].tasks})`
        : 'NO OBJECTIVE (ว่างเปล่า)',
      p2Data: dataB.topObjectives[i]
        ? `${dataB.topObjectives[i].name} (Tasks: ${dataB.topObjectives[i].tasks})`
        : 'NO OBJECTIVE (ว่างเปล่า)',
    }));

    const schemaExampleRounds = Array.from({ length: maxRounds }).map((_, i) => ({
      roundNumber: i + 1,
      p1_badge: `Badge for P1's obj in Thai`,
      p2_badge: `Badge for P2's obj in Thai`,
      commentary: [
        `สรุปรอบ: ประเด็นหลักของรอบ ${i + 1} แบบย่อ (1 บรรทัด)`,
        ``,
        `- ข้อมูลอ้างอิงจาก OKR (อ้างถึงงาน/KR ที่เกี่ยวข้อง): …`,
        `- วิเคราะห์ ${dataA.name}: … (เชิงหลักฐาน ไม่ใช่คำชมทั่วไป)`,
        `- วิเคราะห์ ${dataB.name}: …`,
        `- คำตัดสินรอบนี้: ฝั่งใดมีความพร้อม/ความสมเหตุสมผลมากกว่าในขอบเขตรอบนี้ และเพราะอะไร`,
      ].join('\n'),
    }));

    // ----- Shared tone / format block (used by both prompts) -----
    const sharedToneBlock = `Tone and language requirements:
- Write in Thai (can mix concise engineering English terms such as API, latency, p99, backlog, rollout).
- Style: formal, readable, structured. Prefer clarity over flourish.
- Every bullet must tie to objective/task evidence or the fixed scoring dimensions.
- Do NOT use violent metaphors.

READABILITY & FIXED FORMAT (MANDATORY for all multi-line string fields):
- Inside each JSON string value, use real line breaks between sections (JSON will serialize them as \\n).
- Use hyphen bullets exactly like "- " at the start of each bullet line (one space after the hyphen).
- Start named sections with a short Thai heading line on its own line, then a blank line, then bullets.`;

    const fixedMathBlock = `The math is FIXED. You MUST use these EXACT scores and winner:
${isSelfComparison ? labelA : `Player 1 (${dataA.name})`} Final Score: ${p1Score}
${isSelfComparison ? labelB : `Player 2 (${dataB.name})`} Final Score: ${p2Score}
Winner: ${exactWinner}`;

    // ================= ROUNDS PROMPT =================
    const roundsCommentarySkeleton = isSelfComparison
      ? `rounds[].commentary skeleton (self-review, per objective slot — keep all four bullets):
  Line1: "สรุปรอบ: …" (one line summarizing this objective slot across both cycles)
  blank line
  "- ข้อมูลอ้างอิงจาก OKR ทั้งสองรอบ: …"
  "- ${labelA}: … (พัฒนาการ / ความคืบหน้า / ปัญหาที่พบ)"
  "- ${labelB}: …"
  "- ประเมินการเปลี่ยนแปลง: ดีขึ้น / ถดถอย / คงที่ และเพราะอะไร"`
      : `rounds[].commentary skeleton:
  Line1: "สรุปรอบ: …" (one line)
  blank line
  "- ข้อมูลอ้างอิงจาก OKR: …"
  "- วิเคราะห์ ${dataA.name}: …"
  "- วิเคราะห์ ${dataB.name}: …"
  "- คำตัดสินรอบนี้: …"`;

    const roundsContextBlock = isSelfComparison
      ? `IMPORTANT CONTEXT:
- This is NOT a battle between two different people.
- Both sides are the SAME person (${nameA}) evaluated across two different OKR cycles.
- Player 1 represents ${nameA} in cycle "${labelA}".
- Player 2 represents ${nameA} in cycle "${labelB}".
- Reframe all copy as a self-progression review: growth, regression, consistency, pattern shifts between "${labelA}" and "${labelB}".
- Do NOT use rivalry, combat, winner-vs-loser metaphors. Use neutral, constructive Thai language.
- For each round:
  - p1_badge MUST describe ${nameA} during "${labelA}" for that objective (short, max ~8 words).
  - p2_badge MUST describe ${nameA} during "${labelB}" for that objective.`
      : `IMPORTANT CONTEXT:
- This is a head-to-head OKR comparison between two different people.
- Player 1 = ${dataA.name}. Player 2 = ${dataB.name}.
- For each round:
  - p1_badge and p2_badge MUST be short (max ~8 words), Thai or Thai+English.
- DO NOT MIX UP PLAYER 1 AND PLAYER 2.`;

    const roundsPrompt = `You are a principal engineer writing a strict OKR evaluation brief — ROUNDS SECTION ONLY.

${sharedToneBlock}

${roundsContextBlock}

${roundsCommentarySkeleton}

${fixedMathBlock}

This is OBJECTIVE-BY-OBJECTIVE. You MUST create EXACTLY ${maxRounds} rounds in your JSON array.
Use the pre-matched round data. If a side has "NO OBJECTIVE (ว่างเปล่า)", note it professionally (backlog empty / no scoped work) — still fill every bullet in the commentary skeleton.

Pre-Matched Rounds Data:
${JSON.stringify(matchedRounds, null, 2)}

Respond with a JSON object EXACTLY in this format:
{
  "rounds": ${JSON.stringify(schemaExampleRounds, null, 4)}
}

Return ONLY raw JSON, no code fences, no extra text.`;

    // ================= SUMMARY PROMPT =================
    const summaryContextBlock = isSelfComparison
      ? `IMPORTANT CONTEXT:
- Both sides are the SAME person (${nameA}) evaluated across two different OKR cycles.
- playerA_strengths_weaknesses is about ${nameA} during "${labelA}".
- playerB_strengths_weaknesses is about ${nameA} during "${labelB}".
- Do NOT use rivalry/combat metaphors. Frame as self-progression review.`
      : `IMPORTANT CONTEXT:
- Head-to-head OKR comparison.
- playerA_strengths_weaknesses is for ${dataA.name}.
- playerB_strengths_weaknesses is for ${dataB.name}.`;

    const strengthsSkeleton = `playerA_strengths_weaknesses and playerB_strengths_weaknesses use EXACTLY these Thai headings in order:
  "จุดแข็ง"
  then 2-4 bullets
  blank line
  "จุดที่ควรพัฒนา / ความเสี่ยง"
  then 2-4 bullets
  blank line
  "เชื่อมโยงกับคะแนน (ทำไมถึงได้ระดับนี้)"
  then 2-3 bullets referencing progress breadth, KR/task clarity, consistency, check-in behavior.`;

    const conclusionSkeleton = isSelfComparison
      ? `conclusion uses EXACTLY:
  "สรุปผลการประเมินตนเอง"
  then 2-3 bullets
  blank line
  "เหตุผลที่รอบที่แข็งแรงกว่าได้คะแนนสูงกว่า"
  then 3-5 bullets (explicit comparison by dimension between "${labelA}" and "${labelB}")
  blank line
  "ข้อเสนอแนะสำหรับรอบถัดไป"
  then EXACTLY 2 bullets:
    - one bullet starting "- สิ่งที่ควรรักษาไว้: …"
    - one bullet starting "- สิ่งที่ควรปรับปรุง: …"`
      : `conclusion uses EXACTLY:
  "สรุปผลการประเมิน"
  then 2-3 bullets
  blank line
  "เหตุผลที่ผู้ชนะได้คะแนนสูงกว่า"
  then 3-5 bullets (explicit comparison by dimension)
  blank line
  "ข้อเสนอแนะ"
  then exactly 2 bullets: one line starting "- ${dataA.name}: …" and one "- ${dataB.name}: …"`;

    const introSkeleton = isSelfComparison
      ? `intro_hype: short, max ~2 sentences OR up to 3 bullet lines under heading "บทนำ" with "- " bullets. Neutral self-review tone, not hype. Max one emoji total.`
      : `intro_hype: short, max ~2 sentences OR up to 3 bullet lines under heading "บทนำ" with "- " bullets. Max one emoji total.`;

    const summaryPrompt = `You are a principal engineer writing a strict OKR evaluation brief — SUMMARY SECTIONS ONLY (no rounds).

${sharedToneBlock}

${summaryContextBlock}

${introSkeleton}

${strengthsSkeleton}

${conclusionSkeleton}

${fixedMathBlock}

Player summary data:
- ${isSelfComparison ? `${nameA} @ ${labelA}` : dataA.name}: checkIns=${dataA.checkIns}, avgProgress=${dataA.avgProgress}, objectives=${dataA.topObjectives.length}
- ${isSelfComparison ? `${nameA} @ ${labelB}` : dataB.name}: checkIns=${dataB.checkIns}, avgProgress=${dataB.avgProgress}, objectives=${dataB.topObjectives.length}

Pre-Matched Rounds Data (for reference — do NOT re-emit rounds):
${JSON.stringify(matchedRounds, null, 2)}

Respond with a JSON object EXACTLY in this format:
{
  "intro_hype": "Follow intro_hype format rules above.",
  "playerA_strengths_weaknesses": "Follow strengths/weaknesses format rules above.",
  "playerB_strengths_weaknesses": "Follow strengths/weaknesses format rules above.",
  "conclusion": "Follow conclusion format rules above."
}

Return ONLY raw JSON, no code fences, no extra text.`;

    const anthropic = createAnthropic({ apiKey });

    // Run both halves in parallel. Each has its own retry budget.
    const [roundsResult, summaryResult] = await Promise.all([
      generateJsonWithRetry<{ rounds: unknown[] }>({
        anthropic,
        prompt: roundsPrompt,
        label: 'rounds',
        maxOutputTokens: 4096,
        temperature: 0.4,
      }),
      generateJsonWithRetry<{
        intro_hype: string;
        playerA_strengths_weaknesses: string;
        playerB_strengths_weaknesses: string;
        conclusion: string;
      }>({
        anthropic,
        prompt: summaryPrompt,
        label: 'summary',
        // Summary has 4 long Thai fields (intro + 2 strengths/weaknesses blocks +
        // conclusion with multiple sub-sections). 2048 tokens was getting truncated
        // mid-string, producing invalid JSON that parse recovery couldn't salvage.
        maxOutputTokens: 4096,
        temperature: 0.4,
      }),
    ]);

    if (!roundsResult && !summaryResult) {
      return NextResponse.json(
        { error: 'Data parsing failed at AI level' },
        { status: 502 },
      );
    }

    const rounds = Array.isArray(roundsResult?.rounds) ? roundsResult.rounds : [];

    return NextResponse.json({
      winner: exactWinner,
      scoreA: p1Score,
      scoreB: p2Score,
      rounds,
      intro_hype:
        typeof summaryResult?.intro_hype === 'string' ? summaryResult.intro_hype : '',
      playerA_strengths_weaknesses:
        typeof summaryResult?.playerA_strengths_weaknesses === 'string'
          ? summaryResult.playerA_strengths_weaknesses
          : '',
      playerB_strengths_weaknesses:
        typeof summaryResult?.playerB_strengths_weaknesses === 'string'
          ? summaryResult.playerB_strengths_weaknesses
          : '',
      conclusion:
        typeof (summaryResult as any)?.conclusion === 'string'
          ? (summaryResult as any).conclusion
          : '',
    });
  } catch (error) {
    console.error('Error generating AI comparison:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI comparison' },
      { status: 500 },
    );
  }
}
