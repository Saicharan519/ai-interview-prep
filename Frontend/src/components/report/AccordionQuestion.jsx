import { useState } from 'react';

export default function AccordionQuestion({ index, question, sampleAnswer }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] transition-all hover:border-[#e91e63]/50">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <span className="shrink-0 rounded-lg bg-[#e91e63]/10 px-2.5 py-1 text-xs font-semibold text-[#e91e63]">
          Q{index}
        </span>
        <span className="flex-1 text-sm font-semibold leading-6 text-white">
          {question || 'Question unavailable'}
        </span>
        <span
          className={`text-[#9ca3af] transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          ˅
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[#2a2a2a] px-5 py-4">
          <p className="text-sm leading-6 text-[#9ca3af]">
            {sampleAnswer || 'Sample answer unavailable.'}
          </p>
        </div>
      )}
    </div>
  );
}
