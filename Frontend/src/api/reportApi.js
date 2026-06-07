import axiosInstance from './axiosInstance';

export async function createReport(formData) {
  const response = await axiosInstance.post('/api/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getReports(page = 1, limit = 12) {
  const response = await axiosInstance.get('/api/reports', { params: { page, limit } });
  return response.data;
}

export async function getReportById(id) {
  const response = await axiosInstance.get(`/api/reports/${id}`);
  return response.data;
}

export async function deleteReport(id) {
  const response = await axiosInstance.delete(`/api/reports/${id}`);
  return response.data;
}

export async function downloadPdf(id) {
  const response = await axiosInstance.get(`/api/reports/${id}/pdf`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `report-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
