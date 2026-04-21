import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportList from '../components/report/ReportList';
import useAuth from '../hooks/useAuth';
import useReports from '../hooks/useReports';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reports, loading, error, fetchReports, deleteReport } = useReports();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <main className="mx-auto max-w-6xl px-6 pt-24">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name || 'there'}
          </h1>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Your Interview Reports
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/reports/new')}
          className="rounded-xl bg-[#e91e63] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#c2185b]"
        >
          New Report
        </button>
      </div>

      <ReportList
        reports={reports}
        loading={loading}
        error={error}
        onDelete={deleteReport}
      />
    </main>
  );
}
