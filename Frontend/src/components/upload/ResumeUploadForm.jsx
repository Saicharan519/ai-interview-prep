import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import Loader from '../common/Loader';
import FileDropZone from './FileDropZone';

const maxJobDescriptionLength = 5000;

export default function ResumeUploadForm({ onCreateReport }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [selfDescription, setSelfDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function validate() {
    if (!jobTitle.trim()) {
      return 'Job title is required';
    }

    if (!jobDescription.trim()) {
      return 'Target job description is required';
    }

    if (!resumeFile && !selfDescription.trim()) {
      return 'Upload a resume or add a quick self-description';
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      // FormData mirrors the backend field names exactly for file or text resume input.
      formData.append('jobTitle', jobTitle.trim());
      formData.append('jobDescription', jobDescription.trim());

      if (resumeFile) {
        formData.append('resume', resumeFile);
      } else {
        formData.append('resumeText', selfDescription.trim());
      }

      await onCreateReport(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl pb-28">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white md:text-5xl">
          Create Your Custom{' '}
          <span className="text-[#e91e63]">Interview Plan</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#9ca3af] md:text-base">
          Add the role you are targeting and your background. The AI will build
          a focused strategy with questions, gaps, and a learning roadmap.
        </p>
      </div>

      <div className="mb-5 space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
          Job Title
        </label>
        <input
          value={jobTitle}
          onChange={(event) => setJobTitle(event.target.value)}
          disabled={loading}
          placeholder="Junior Node.js Developer"
          className="w-full rounded-xl border border-[#2a2a2a] bg-[#222222] px-4 py-3 text-white placeholder-gray-500 focus:border-[#e91e63] focus:outline-none disabled:opacity-60"
        />
      </div>

      <div className="mb-5">
        <ErrorMessage message={error} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-lg" aria-hidden="true">
              ▣
            </span>
            <h2 className="text-lg font-bold text-white">
              Target Job Description
            </h2>
            <span className="rounded border border-[#e91e63] px-2 py-0.5 text-xs text-[#e91e63]">
              REQUIRED
            </span>
          </div>

          <div className="relative">
            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(
                  event.target.value.slice(0, maxJobDescriptionLength)
                )
              }
              disabled={loading}
              rows={17}
              placeholder={`Paste the job description here...\n\nExample:\nWe are looking for a Node.js developer with experience building REST APIs, MongoDB schemas, authentication flows, and production-ready Express services.`}
              className="min-h-[400px] w-full resize-none rounded-xl bg-[#1a1a1a] px-0 py-2 text-sm leading-6 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60"
            />
            <p className="absolute bottom-2 right-2 text-xs text-[#6b7280]">
              {jobDescription.length} / {maxJobDescriptionLength} chars
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-lg" aria-hidden="true">
              ◉
            </span>
            <h2 className="text-lg font-bold text-white">Your Profile</h2>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              Upload Resume
            </label>
            <span className="rounded border border-[#e91e63] px-2 py-0.5 text-xs text-[#e91e63]">
              BEST RESULTS
            </span>
          </div>

          <FileDropZone
            selectedFile={resumeFile}
            onFileSelect={setResumeFile}
            disabled={loading}
          />

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#2a2a2a]" />
            <span className="text-xs font-semibold text-[#6b7280]">OR</span>
            <div className="h-px flex-1 bg-[#2a2a2a]" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              Quick Self-Description
            </label>
            <textarea
              value={selfDescription}
              onChange={(event) => setSelfDescription(event.target.value)}
              disabled={loading || Boolean(resumeFile)}
              rows={8}
              placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
              className="w-full resize-none rounded-xl border border-[#2a2a2a] bg-[#222222] px-4 py-3 text-sm leading-6 text-white placeholder-gray-500 focus:border-[#e91e63] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="mt-4 rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 text-sm text-blue-200">
            Either a Resume or a Self Description is required to generate a
            personalized plan.
          </div>
        </section>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/80 backdrop-blur-sm">
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <Loader size="lg" />
            </div>
            <p className="font-semibold text-white">
              AI is analyzing your resume... (~30 seconds)
            </p>
            <p className="mt-2 text-sm text-[#9ca3af]">
              Keep this page open while your report is generated.
            </p>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#2a2a2a] bg-[#111111]/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#e91e63] px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-[#c2185b] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'AI is analyzing...' : 'Generate My Interview Strategy'}
          </button>
          <p className="mt-2 text-center text-xs text-[#6b7280]">
            AI-Powered Strategy Generation - Approx 30s
          </p>
        </div>
      </div>
    </form>
  );
}
