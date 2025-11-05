import axiosInstance from '../../utils/axiosInstance';
import type { RiskAssessment, MatrixConfig, DashboardData } from './types';

export const RisksApi = {
  async fetchAssessments(params?: { status?: string; category?: string; site?: string }): Promise<RiskAssessment[]> {
    const res = await axiosInstance.get('/risks/assessments/', { params });
    return res.data as RiskAssessment[];
  },

  async exportExcel(params?: { status?: string; category?: string; site?: string }): Promise<Blob> {
    const res = await axiosInstance.get('/risks/export-excel/', { params, responseType: 'blob' });
    return res.data as Blob;
  },

  async importExcel(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    await axiosInstance.post('/risks/import-excel/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  async fetchMatrixConfig(): Promise<MatrixConfig> {
    const res = await axiosInstance.get('/risks/matrix-config/');
    return res.data as MatrixConfig;
  },

  async fetchDashboard(): Promise<DashboardData> {
    const res = await axiosInstance.get('/risks/dashboard/');
    return res.data as DashboardData;
  },

  async deleteAssessment(id: string): Promise<void> {
    await axiosInstance.delete(`/risks/assessments/${id}/`);
  },

  async approveAssessment(id: string): Promise<void> {
    await axiosInstance.post(`/risks/assessments/${id}/approve/`);
  },
};


