export default function SkillGapTags({ skillGaps = [] }) {
  const gaps = Array.isArray(skillGaps) ? skillGaps : [];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
        Skill Gaps
      </h3>

      {gaps.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {gaps.map((gap) => (
            <span
              key={gap}
              className="rounded-full border border-[#ef4444]/30 bg-[#2a1a1a] px-3 py-1 text-xs text-[#ef4444]"
            >
              {gap}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#9ca3af]">No skill gaps detected</p>
      )}
    </div>
  );
}
