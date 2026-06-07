import { useCallback, useState } from 'react';
import {
  deleteReport as deleteReportRequest,
  getReports,
} from '../api/reportApi';

export default function useReports() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async (page = 1, limit = 12) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getReports(page, limit);
      setReports(data.reports ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReport = useCallback(
    async (id) => {
      const snapshot = reports;
      setReports((prev) => prev.filter((r) => r._id !== id));
      setError(null);

      try {
        await deleteReportRequest(id);
      } catch (err) {
        setReports(snapshot);
        setError(err.response?.data?.message ?? 'Failed to delete report');
      }
    },
    [reports]
  );

  return { reports, pagination, loading, error, fetchReports, deleteReport };
}
