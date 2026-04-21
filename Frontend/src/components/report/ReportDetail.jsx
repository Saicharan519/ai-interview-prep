import { useState } from 'react';
import AccordionQuestion from './AccordionQuestion';
import RoadmapSection from './RoadmapSection';
import ScoreRing from './ScoreRing';
import SkillGapTags from './SkillGapTags';

const sections = [
  { id: 'technical', label: 'Technical Questions', icon: '<>' },
  { id: 'behavioral', label: 'Behavioral Questions', icon: '💬' },
  { id: 'roadmap', label: 'Road Map', icon: '🗺️' },
];

function getMatchLabel(score) {
  if (score >= 75) {
    return 'Strong match for this role';
  }

  if (score >= 50) {
    return 'Moderate match';
  }

  return 'Low match';
}

function QuestionSection({ title, questions }) {
  const safeQuestions = Array.isArray(questions) ? questions : [];

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="rounded-full bg-[#2a2a2a] px-2.5 py-1 text-xs text-[#9ca3af]">
          {safeQuestions.length}
        </span>
      </div>

      <div className="space-y-3">
        {safeQuestions.map((item, index) => (
          <AccordionQuestion
            key={`${item.question}-${index}`}
            index={index + 1}
            question={item.question}
            sampleAnswer={item.sampleAnswer}
          />
        ))}
      </div>
    </section>
  );
}

export default function ReportDetail({ report }) {
  const [activeSection, setActiveSection] = useState('technical');
  const matchScore = report?.matchScore || 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[12rem_1fr_16rem]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
          Sections
        </p>
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeSection === section.id
                  ? 'bg-[#e91e63]/10 text-[#e91e63]'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="min-w-0">
        <div className="mb-6 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Target Role
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            {report?.jobTitle || 'Interview Report'}
          </h1>
        </div>

        {activeSection === 'technical' && (
          <QuestionSection
            title="Technical Questions"
            questions={report?.technicalQuestions}
          />
        )}

        {activeSection === 'behavioral' && (
          <QuestionSection
            title="Behavioral Questions"
            questions={report?.behavioralQuestions}
          />
        )}

        {activeSection === 'roadmap' && (
          <section>
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">Road Map</h2>
              <span className="rounded-full bg-[#2a2a2a] px-2.5 py-1 text-xs text-[#9ca3af]">
                {report?.roadmap?.length || 0}
              </span>
            </div>
            <RoadmapSection roadmap={report?.roadmap} />
          </section>
        )}
      </main>

      <aside className="space-y-6 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 lg:sticky lg:top-24 lg:self-start">
        <div className="text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Match Score
          </p>
          <ScoreRing score={matchScore} label="Match Score" size="lg" />
          <p className="mt-4 text-sm font-semibold text-white">
            {getMatchLabel(matchScore)}
          </p>
        </div>

        <div className="h-px bg-[#2a2a2a]" />
        <SkillGapTags skillGaps={report?.skillGaps} />
        <div className="h-px bg-[#2a2a2a]" />
        <ScoreRing score={report?.atsScore || 0} label="ATS Score" size="sm" />
      </aside>
    </div>
  );
}
