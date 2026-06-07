import { useState } from 'react';
import ScoreRing from './ScoreRing';

const verdictStyles = {
  full: {
    label: 'FULL MATCH',
    text: 'text-[#22c55e]',
    bar: 'bg-[#22c55e]',
    box: 'border-[#22c55e]/30 bg-[#22c55e]/5',
  },
  partial: {
    label: 'PARTIAL',
    text: 'text-[#f59e0b]',
    bar: 'bg-[#f59e0b] stripe-amber',
    box: 'border-[#f59e0b]/30 bg-[#f59e0b]/5',
  },
  none: {
    label: 'NO MATCH',
    text: 'text-[#ef4444]',
    bar: 'bg-[#ef4444]',
    box: 'border-[#ef4444]/30 bg-[#ef4444]/5',
  },
};

function VerdictPill({ verdict }) {
  const style = verdictStyles[verdict] ?? verdictStyles.none;
  return (
    <span
      className={`inline-flex items-center gap-2 border ${style.box} px-2.5 py-1 text-[10px] tracking-[0.18em] ${style.text} font-mono-meta`}
    >
      <span className={`h-1.5 w-1.5 ${style.bar}`} />
      {style.label}
    </span>
  );
}

function BlockHeader({ number, title }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono-meta text-[10px] tracking-[0.2em] text-[#6b7280]">
        {number}
      </span>
      <span className="h-px flex-1 bg-[#2a2a2a]" />
      <span className="font-mono-meta text-[10px] tracking-[0.2em] text-[#9ca3af]">
        {title}
      </span>
    </div>
  );
}

function SkillRow({ skill, state }) {
  const conf = {
    matched: { sign: '+', tone: 'text-[#22c55e]' },
    partial: { sign: '~', tone: 'text-[#f59e0b]' },
    missing: { sign: '−', tone: 'text-[#ef4444]' },
  }[state];

  return (
    <li className="flex items-baseline gap-2 py-1">
      <span className={`font-mono-meta text-[10px] leading-none ${conf.tone}`}>
        {conf.sign}
      </span>
      <span className="font-mono-meta text-[12px] leading-snug text-white/85">
        {skill}
      </span>
    </li>
  );
}

function getMatchLabel(score) {
  if (score >= 75) return 'Strong match for this role';
  if (score >= 55) return 'Moderate match';
  if (score >= 35) return 'Weak match';
  return 'Poor match';
}

// "How is this calculated?" panel — shows the deterministic formula.
// This is the trust UX: a recruiter clicks it, sees the math, knows the score
// isn't an LLM hallucination but a reproducible computation.
function ScoreMathPanel({ breakdown, total }) {
  const math = breakdown?.scoreMath;
  if (!math) return null;

  const matched = breakdown?.requiredSkillsMatched?.length ?? 0;
  const partial = breakdown?.requiredSkillsPartial?.length ?? 0;
  const missing = breakdown?.requiredSkillsMissing?.length ?? 0;
  const T = matched + partial + missing;

  const expVerdict = breakdown?.experienceMatch?.verdict ?? 'none';
  const domVerdict = breakdown?.domainMatch?.verdict ?? 'none';

  const Row = ({ label, value, sub }) => (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#2a2a2a] py-2 last:border-0">
      <div className="min-w-0">
        <div className="font-mono-meta text-[10px] tracking-[0.18em] text-white/70">
          {label}
        </div>
        {sub && (
          <div className="font-mono-meta mt-0.5 text-[10px] text-[#6b7280]">{sub}</div>
        )}
      </div>
      <div
        className="text-2xl text-white"
        style={{ fontFamily: '"Instrument Serif", serif' }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div className="mt-4 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-4">
      <p className="font-mono-meta mb-3 text-[10px] tracking-[0.2em] text-[#9ca3af]">
        FORMULA
      </p>
      <Row
        label="SKILLS"
        value={math.skillsPoints}
        sub={`((${matched}×2)+${partial}) / (${T}×2) × 60`}
      />
      <Row label="EXPERIENCE" value={math.experiencePoints} sub={expVerdict.toUpperCase()} />
      <Row label="DOMAIN" value={math.domainPoints} sub={domVerdict.toUpperCase()} />
      <div className="mt-2 flex items-baseline justify-between gap-3 border-t-2 border-[#e91e63]/40 pt-2">
        <div className="font-mono-meta text-[10px] tracking-[0.22em] text-[#e91e63]">
          TOTAL
        </div>
        <div
          className="text-3xl text-[#e91e63]"
          style={{ fontFamily: '"Instrument Serif", serif' }}
        >
          {total}
        </div>
      </div>
      <p className="font-mono-meta mt-3 text-[9px] leading-relaxed tracking-wide text-[#6b7280]">
        Score computed in the backend from the AI's evidence — not by the LLM.
        Reproducible across runs.
      </p>
    </div>
  );
}

export default function ScoreBreakdown({ report }) {
  const [showMath, setShowMath] = useState(false);

  const matchScore = report?.matchScore ?? 0;
  const atsScore = report?.atsScore ?? 0;
  const breakdown = report?.scoreBreakdown;

  // Legacy reports (created before scoreBreakdown existed) fall back to the
  // older skillGaps array so nothing renders blank.
  const matched = breakdown?.requiredSkillsMatched ?? [];
  const partial = breakdown?.requiredSkillsPartial ?? [];
  const missing = breakdown?.requiredSkillsMissing ?? report?.skillGaps ?? [];
  const optional = breakdown?.optionalSkillsMatched ?? [];

  return (
    <aside className="space-y-8 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 lg:sticky lg:top-24 lg:self-start">
      <div className="text-center">
        <p className="mb-4 font-mono-meta text-[10px] tracking-[0.2em] text-[#6b7280]">
          MATCH SCORE
        </p>
        <ScoreRing score={matchScore} label="" size="lg" />
        <p className="mt-4 text-sm font-semibold text-white">
          {getMatchLabel(matchScore)}
        </p>

        {breakdown?.scoreMath && (
          <button
            type="button"
            onClick={() => setShowMath((v) => !v)}
            className="font-mono-meta mt-3 inline-flex items-center gap-1.5 text-[10px] tracking-[0.18em] text-[#9ca3af] transition-colors hover:text-white"
          >
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#9ca3af] text-[8px]">
              i
            </span>
            {showMath ? 'HIDE FORMULA' : 'HOW IS THIS CALCULATED?'}
          </button>
        )}

        {showMath && <ScoreMathPanel breakdown={breakdown} total={matchScore} />}
      </div>

      <section>
        <BlockHeader number="01" title="REQUIRED SKILLS" />

        {matched.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 font-mono-meta text-[10px] tracking-[0.18em] text-[#22c55e]/80">
              MATCHED · {matched.length}
            </p>
            <ul>
              {matched.map((s) => (
                <SkillRow key={s} skill={s} state="matched" />
              ))}
            </ul>
          </div>
        )}

        {partial.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 font-mono-meta text-[10px] tracking-[0.18em] text-[#f59e0b]/80">
              PARTIAL · {partial.length}
            </p>
            <ul>
              {partial.map((s) => (
                <SkillRow key={s} skill={s} state="partial" />
              ))}
            </ul>
          </div>
        )}

        {missing.length > 0 && (
          <div>
            <p className="mb-2 font-mono-meta text-[10px] tracking-[0.18em] text-[#ef4444]/80">
              MISSING · {missing.length}
            </p>
            <ul>
              {missing.map((s) => (
                <SkillRow key={s} skill={s} state="missing" />
              ))}
            </ul>
          </div>
        )}

        {optional.length > 0 && (
          <div className="mt-4 border-t border-[#2a2a2a] pt-3">
            <p className="mb-2 font-mono-meta text-[10px] tracking-[0.18em] text-[#6b7280]">
              BONUS · {optional.length}
            </p>
            <ul>
              {optional.map((s) => (
                <SkillRow key={s} skill={s} state="matched" />
              ))}
            </ul>
          </div>
        )}
      </section>

      {breakdown?.experienceMatch && (
        <section>
          <BlockHeader number="02" title="EXPERIENCE" />

          <dl className="space-y-3">
            <div>
              <dt className="font-mono-meta text-[10px] tracking-[0.18em] text-[#6b7280]">
                REQUIRED
              </dt>
              <dd className="mt-1 text-[13px] leading-snug text-white/90">
                {breakdown.experienceMatch.required || '—'}
              </dd>
            </div>
            <div>
              <dt className="font-mono-meta text-[10px] tracking-[0.18em] text-[#6b7280]">
                CANDIDATE
              </dt>
              <dd className="mt-1 text-[13px] leading-snug text-white/90">
                {breakdown.experienceMatch.candidate || '—'}
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <VerdictPill verdict={breakdown.experienceMatch.verdict} />
          </div>
        </section>
      )}

      {breakdown?.domainMatch && (
        <section>
          <BlockHeader number="03" title="DOMAIN FIT" />
          <div className="mb-3">
            <VerdictPill verdict={breakdown.domainMatch.verdict} />
          </div>
          <p className="text-[13px] leading-relaxed text-white/80">
            {breakdown.domainMatch.reason || '—'}
          </p>
        </section>
      )}

      <section className="border-t border-[#2a2a2a] pt-6">
        <ScoreRing score={atsScore} label="ATS SCORE" size="sm" />
      </section>
    </aside>
  );
}
