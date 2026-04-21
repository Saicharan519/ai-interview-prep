import { useNavigate } from 'react-router-dom';
import { createReport } from '../api/reportApi';
import ResumeUploadForm from '../components/upload/ResumeUploadForm';

export default function NewReportPage() {
  const navigate = useNavigate();

  async function handleCreateReport(formData) {
    const data = await createReport(formData);
    navigate(`/reports/${data.report._id}`);
  }

  return (
    <main className="px-6 pt-24">
      <ResumeUploadForm onCreateReport={handleCreateReport} />
    </main>
  );
}
