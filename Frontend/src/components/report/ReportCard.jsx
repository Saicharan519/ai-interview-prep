import { Link } from 'react-router-dom';
import { useState } from 'react';
import formatDate from '../../utils/formatDate';
import ScoreRing from './ScoreRing';

export default function ReportCard({ report, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const id = report?._id;
  const skillGapCount = report?.skillGaps?.length || 0;

  return (
    <article className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all hover:border-[#e91e63]/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="line-clamp-2 text-lg font-bold text-white">
            {report?.jobTitle || 'Untitled Report'}
          </h3>
          <p className="mt-2 text-sm text-[#9ca3af]">
            {skillGapCount} skill gaps identified
          </p>
        </div>
        <ScoreRing score={report?.matchScore || 0} label="Match" size="sm" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-[#6b7280]">{formatDate(report?.createdAt)}</p>

        <div className="flex items-center gap-2">
          {confirming ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#9ca3af]">Sure?</span>
              <button
                type="button"
                onClick={() => onDelete?.(id)}
                className="text-[#ef4444] hover:text-red-300"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-[#9ca3af] hover:text-white"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <Link
                to={`/reports/${id}`}
                className="rounded-lg border border-[#e91e63] px-3 py-1.5 text-xs font-semibold text-[#e91e63] transition-colors hover:bg-[#e91e63] hover:text-white"
              >
                View Report
              </Link>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="px-1 text-lg leading-none text-gray-500 transition-colors hover:text-red-400"
                aria-label="Delete report"
              >
                ×
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
