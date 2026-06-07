import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReportById } from '../api/reportApi';
import { streamEvaluation } from '../api/interviewApi';
import ErrorMessage from '../components/common/ErrorMessage';
import Loader from '../components/common/Loader';

const MAX_ANSWER = 5000;

// Lightweight markdown renderer for the structured prompt output.
// Handles: ### headings, **bold**, "- " bullets, blank-line paragraphs.
function renderInlineBold(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-t-${i}`}>{part}</span>;
  });
}

function FeedbackBody({ text, streaming }) {
  const blocks = useMemo(() => {
    const lines = text.split('\n');
    const out = [];
    let bullets = [];

    const flushBullets = () => {
      if (bullets.length) {
        out.push({ type: 'ul', items: bullets });
        bullets = [];
      }
    };

    for (const raw of lines) {
      const line = raw.trimEnd();
      if (line.startsWith('### ')) {
        flushBullets();
        out.push({ type: 'h3', text: line.slice(4) });
      } else if (line.startsWith('- ')) {
        bullets.push(line.slice(2));
      } else if (line.trim() === '') {
        flushBullets();
        out.push({ type: 'sp' });
      } else {
        flushBullets();
        out.push({ type: 'p', text: line });
      }
    }
    flushBullets();
    return out;
  }, [text]);

  return (
    <div className="text-[14px] leading-7 text-white/85">
      {blocks.map((b, i) => {
        if (b.type === 'h3') {
          return (
            <h3
              key={i}
              className="font-mono-meta mt-5 text-[11px] tracking-[0.22em] text-[#e91e63]"
            >
              {b.text.toUpperCase()}
            </h3>
          );
        }
        if (b.type === 'ul') {
          return (
            <ul key={i} className="my-2 space-y-1.5">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#e91e63]" />
                  <span>{renderInlineBold(it, `${i}-${j}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === 'p') {
          return (
            <p key={i} className="my-2">
              {renderInlineBold(b.text, `${i}`)}
            </p>
          );
        }
        return <div key={i} className="h-2" />;
      })}
      {streaming && (
        <span className="caret-blink ml-0.5 inline-block h-4 w-[7px] translate-y-[2px] bg-[#e91e63]" />
      )}
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = total === 0 ? 0 : (current / total) * 100;
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono-meta text-[10px] tracking-[0.2em] text-[#6b7280]">
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      <div className="relative h-px w-40 overflow-hidden bg-[#2a2a2a]">
        <div
          className="absolute inset-y-0 left-0 bg-[#e91e63] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LiveIndicator({ active }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono-meta text-[10px] tracking-[0.22em] text-white/70">
      <span
        className={`h-2 w-2 rounded-full ${
          active ? 'bg-[#38bdf8] live-pulse' : 'bg-[#2a2a2a]'
        }`}
      />
      {active ? 'INTERVIEWER · LIVE' : 'INTERVIEWER FEEDBACK'}
    </span>
  );
}

function CompletionScreen({ report, count, startedAt, onRestart, onExit }) {
  const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
  return (
    <div className="mx-auto max-w-3xl pt-20 text-center">
      <p className="font-mono-meta text-[10px] tracking-[0.25em] text-[#e91e63]">
        SESSION COMPLETE
      </p>
      <h1
        className="font-serif-display mt-6 text-5xl leading-[1.05] text-white md:text-6xl"
        style={{ fontFamily: '"Instrument Serif", serif' }}
      >
        That's a wrap.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-white/70">
        You completed {count} interview {count === 1 ? 'question' : 'questions'} for the{' '}
        <span className="text-white">{report.jobTitle}</span> role. Real interviews
        feel different — but the muscle is the same.
      </p>

      <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#2a2a2a]">
        {[
          ['QUESTIONS', count],
          ['MINUTES', minutes],
          ['MATCH', `${report.matchScore ?? 0}%`],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#1a1a1a] px-4 py-5">
            <dt className="font-mono-meta text-[9px] tracking-[0.22em] text-[#6b7280]">
              {label}
            </dt>
            <dd
              className="mt-2 text-3xl text-white"
              style={{ fontFamily: '"Instrument Serif", serif' }}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onRestart}
          className="font-mono-meta border border-[#2a2a2a] px-5 py-3 text-[11px] tracking-[0.2em] text-white/80 transition-colors hover:border-[#e91e63] hover:text-white"
        >
          PRACTICE AGAIN
        </button>
        <button
          type="button"
          onClick={onExit}
          className="font-mono-meta bg-[#e91e63] px-5 py-3 text-[11px] tracking-[0.2em] text-white transition-colors hover:bg-[#c2185b]"
        >
          BACK TO REPORT →
        </button>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Question deck: technicals first, then behaviorals.
  const [deck, setDeck] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [done, setDone] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const abortRef = useRef(null);
  const feedbackEndRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getReportById(id)
      .then((data) => {
        if (!active) return;
        setReport(data.report);
        const t = (data.report.technicalQuestions ?? []).map((q) => ({
          kind: 'TECHNICAL',
          question: q.question,
        }));
        const b = (data.report.behavioralQuestions ?? []).map((q) => ({
          kind: 'BEHAVIORAL',
          question: q.question,
        }));
        setDeck([...t, ...b]);
      })
      .catch((err) =>
        setLoadError(err.response?.data?.message ?? 'Failed to load report')
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (streaming) {
      feedbackEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [feedback, streaming]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const current = deck[cursor];
  const total = deck.length;

  async function handleSubmit() {
    if (!answer.trim() || streaming) return;
    setStreaming(true);
    setStreamError(null);
    setFeedback('');

    const controller = new AbortController();
    abortRef.current = controller;

    await streamEvaluation({
      reportId: id,
      question: current.question,
      userAnswer: answer,
      signal: controller.signal,
      onChunk: (chunk) => setFeedback((prev) => prev + chunk),
      onDone: () => setStreaming(false),
      onError: (err) => {
        setStreamError(err.message ?? 'Evaluation failed');
        setStreaming(false);
      },
    });
  }

  function goNext() {
    if (cursor + 1 >= total) {
      setDone(true);
      return;
    }
    setCursor((c) => c + 1);
    setAnswer('');
    setFeedback('');
    setStreamError(null);
  }

  function goPrev() {
    if (cursor === 0) return;
    setCursor((c) => c - 1);
    setAnswer('');
    setFeedback('');
    setStreamError(null);
  }

  function restart() {
    setCursor(0);
    setAnswer('');
    setFeedback('');
    setDone(false);
    setStreamError(null);
  }

  if (loading) return <Loader fullScreen size="lg" />;
  if (loadError) {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-32">
        <ErrorMessage message={loadError} />
      </main>
    );
  }
  if (!current && !done) {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-32 text-center">
        <p className="text-[#9ca3af]">This report has no interview questions yet.</p>
      </main>
    );
  }

  if (done) {
    return (
      <main className="px-6 pb-20 pt-24">
        <CompletionScreen
          report={report}
          count={total}
          startedAt={startedAt}
          onRestart={restart}
          onExit={() => navigate(`/reports/${id}`)}
        />
      </main>
    );
  }

  return (
    <main className="px-6 pb-32 pt-24">
      {streaming && (
        <div className="shimmer-bar fixed left-0 right-0 top-[68px] z-50 h-px" />
      )}

      <div className="mx-auto max-w-3xl">
        <div className="mb-12 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/reports/${id}`)}
            className="font-mono-meta text-[10px] tracking-[0.22em] text-[#9ca3af] transition-colors hover:text-white"
          >
            ← BACK TO REPORT
          </button>
          <ProgressBar current={cursor + 1} total={total} />
        </div>

        <header className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <span className="font-mono-meta text-[10px] tracking-[0.25em] text-[#e91e63]">
              {current.kind}
            </span>
            <span className="h-px flex-1 bg-[#2a2a2a]" />
            <span className="font-mono-meta text-[10px] tracking-[0.22em] text-[#6b7280]">
              QUESTION {String(cursor + 1).padStart(2, '0')}
            </span>
          </div>

          <h1
            className="text-[32px] leading-[1.15] text-white md:text-[44px]"
            style={{ fontFamily: '"Instrument Serif", serif', letterSpacing: '-0.015em' }}
          >
            {current.question}
          </h1>
        </header>

        <section className="mb-10">
          <div className="mb-3 flex items-baseline justify-between">
            <label className="font-mono-meta text-[10px] tracking-[0.22em] text-[#9ca3af]">
              YOUR ANSWER
            </label>
            <span className="font-mono-meta text-[10px] text-[#6b7280]">
              {answer.length} / {MAX_ANSWER}
            </span>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value.slice(0, MAX_ANSWER))}
            disabled={streaming}
            rows={9}
            placeholder="Take your time. Explain it as if I'm interviewing you right now…"
            className="w-full resize-none rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-5 py-4 text-[15px] leading-7 text-white placeholder-[#4b4b4b] focus:border-[#e91e63] focus:outline-none disabled:opacity-60"
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!answer.trim() || streaming}
              className="font-mono-meta inline-flex items-center gap-2 bg-[#e91e63] px-5 py-3 text-[11px] tracking-[0.2em] text-white transition-colors hover:bg-[#c2185b] disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#6b7280]"
            >
              {streaming ? 'EVALUATING…' : 'SUBMIT FOR REVIEW →'}
            </button>
          </div>
        </section>

        {(feedback || streaming || streamError) && (
          <section className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-7">
            <div className="mb-5 flex items-center justify-between">
              <LiveIndicator active={streaming} />
              {streaming && (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  className="font-mono-meta text-[10px] tracking-[0.18em] text-[#9ca3af] hover:text-white"
                >
                  STOP
                </button>
              )}
            </div>

            <div className="scrollbar-muted max-h-[60vh] overflow-y-auto pr-2">
              {streamError ? (
                <ErrorMessage message={streamError} />
              ) : (
                <FeedbackBody text={feedback} streaming={streaming} />
              )}
              <div ref={feedbackEndRef} />
            </div>
          </section>
        )}

        {feedback && !streaming && (
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={cursor === 0}
              className="font-mono-meta text-[11px] tracking-[0.2em] text-[#9ca3af] transition-colors hover:text-white disabled:opacity-30"
            >
              ← PREVIOUS
            </button>
            <button
              type="button"
              onClick={goNext}
              className="font-mono-meta border border-[#e91e63] px-5 py-3 text-[11px] tracking-[0.2em] text-[#e91e63] transition-colors hover:bg-[#e91e63] hover:text-white"
            >
              {cursor + 1 >= total ? 'FINISH SESSION →' : 'NEXT QUESTION →'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
