export default function RoadmapSection({ roadmap = [] }) {
  const items = Array.isArray(roadmap) ? roadmap : [];

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-sm text-[#9ca3af]">
        No roadmap items were generated for this report.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <article
          key={`${item.skill || 'skill'}-${index}`}
          className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5"
        >
          <h3 className="text-lg font-bold text-white">
            {item.skill || 'Recommended Skill'}
          </h3>

          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              Resources
            </h4>
            {item.resources?.length ? (
              <ul className="space-y-1 text-sm text-[#e91e63]">
                {item.resources.map((resource, resourceIndex) => (
                  <li key={`${resource}-${resourceIndex}`}>{resource}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#9ca3af]">
                No specific resources listed.
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              Steps
            </h4>
            {item.steps?.length ? (
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-[#9ca3af]">
                {item.steps.map((step, stepIndex) => (
                  <li key={`${step}-${stepIndex}`}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[#9ca3af]">
                No steps were generated for this skill.
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
