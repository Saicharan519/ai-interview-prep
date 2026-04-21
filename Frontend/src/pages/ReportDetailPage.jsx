import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { downloadPdf, getReportById } from '../api/reportApi';
import ErrorMessage from '../components/common/ErrorMessage';
import Loader from '../components/common/Loader';
import ReportDetail from '../components/report/ReportDetail';

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchReport() {
      setLoading(true);
      setError(null);

      try {
        const data = await getReportById(id);
        if (active) {
          setReport(data.report);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load report');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchReport();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);

    try {
      await downloadPdf(id);
    } catch (err) {
      setDownloadError(err.response?.data?.message || 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return <Loader fullScreen size="lg" />;
  }

  return (
    <main className="mx-auto max-w-7xl px-6 pt-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-sm font-semibold text-[#9ca3af] transition-colors hover:text-white"
        >
          ← Dashboard
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !report}
          className="rounded-xl bg-[#e91e63] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#c2185b] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      <div className="mb-5 space-y-3">
        <ErrorMessage message={error} />
        <ErrorMessage message={downloadError} />
      </div>

      {report && <ReportDetail report={report} />}
    </main>
  );
}
