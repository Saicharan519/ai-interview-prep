import { useCallback, useState } from 'react';
import {
  deleteReport as deleteReportRequest,
  getReports,
} from '../api/reportApi';

export default function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getReports();
      setReports(data.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReport = useCallback(async (id) => {
    const previousReports = reports;
    setReports((currentReports) =>
      currentReports.filter((report) => report._id !== id)
    );
    setError(null);

    try {
      await deleteReportRequest(id);
    } catch (err) {
      setReports(previousReports);
      setError(err.response?.data?.message || 'Failed to delete report');
    }
  }, [reports]);

  return { reports, loading, error, fetchReports, deleteReport };
}
