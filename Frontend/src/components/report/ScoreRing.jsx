function getScoreColor(score) {
  if (score >= 75) {
    return '#22c55e';
  }

  if (score >= 50) {
    return '#f59e0b';
  }

  return '#ef4444';
}

function getScoreTextClass(score) {
  if (score >= 75) {
    return 'text-[#22c55e]';
  }

  if (score >= 50) {
    return 'text-[#f59e0b]';
  }

  return 'text-[#ef4444]';
}

export default function ScoreRing({ score = 0, label = 'Score', size = 'sm' }) {
  const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0));
  const isLarge = size === 'lg';
  const radius = isLarge ? 52 : 30;
  const viewBox = isLarge ? 120 : 80;
  const strokeWidth = isLarge ? 9 : 6;
  const center = viewBox / 2;
  // SVG stroke-dasharray and stroke-dashoffset are used to draw the arc.
  // circumference = 2 * pi * r. offset = circumference * (1 - score/100)
  // This gives a smooth filled arc proportional to the score value.
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - normalizedScore / 100);
  const color = getScoreColor(normalizedScore);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${isLarge ? 'h-[120px] w-[120px]' : 'h-20 w-20'}`}>
        <svg
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          className="-rotate-90"
          aria-label={`${label}: ${normalizedScore}%`}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#2a2a2a"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`${isLarge ? 'text-3xl' : 'text-lg'} ${getScoreTextClass(normalizedScore)} font-bold`}
          >
            {normalizedScore}%
          </span>
        </div>
      </div>
      <p className="text-center text-xs text-[#9ca3af]">{label}</p>
    </div>
  );
}
