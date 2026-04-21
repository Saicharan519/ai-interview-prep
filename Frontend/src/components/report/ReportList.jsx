import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../common/ErrorMessage';
import ReportCard from './ReportCard';

function SkeletonCard() {
  return <div className="h-36 animate-pulse rounded-xl bg-[#1a1a1a]" />;
}

export default function ReportList({ reports = [], loading, error, onDelete }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!reports.length) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
        <div className="mb-4 text-4xl" aria-hidden="true">
          □
        </div>
        <h3 className="text-xl font-bold text-white">No reports yet</h3>
        <p className="mt-2 text-sm text-[#9ca3af]">
          Create your first AI interview plan.
        </p>
        <button
          type="button"
          onClick={() => navigate('/reports/new')}
          className="mt-6 rounded-xl bg-[#e91e63] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#c2185b]"
        >
          Get Started
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <ReportCard key={report._id} report={report} onDelete={onDelete} />
      ))}
    </div>
  );
}
