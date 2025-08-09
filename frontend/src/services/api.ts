import axiosInstance from '../utils/axiosInstance';
import {
  User,
  Document,
  PPEItem,
  PPEInventory,
  PPEPurchase,
  PPEIssuance,
  PPEDamageReport,
  PPEVendor,
  LegalDocument,
  LegislationTracker,
  Audit,
  AuditFinding,
  PerformanceMetric,
  Notification,
  Department,
  SystemSettings,
  PaginatedResponse,
  ApiResponse,
  LoginCredentials,
  RegisterData,
  AuthTokens,
} from '../types';

// Base API service class
class ApiService {
  // Generic methods
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await axiosInstance.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await axiosInstance.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await axiosInstance.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await axiosInstance.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await axiosInstance.delete<T>(url);
    return response.data;
  }

  // File upload
  async uploadFile<T>(url: string, formData: FormData): Promise<T> {
    const response = await axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// Authentication service
export class AuthService extends ApiService {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    return this.post('/auth/login/', credentials);
  }

  async register(userData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    return this.post('/auth/register/', userData);
  }

  async logout(): Promise<void> {
    return this.post('/auth/logout/');
  }

  async refreshToken(refresh: string): Promise<{ access: string }> {
    return this.post('/auth/refresh/', { refresh });
  }

  async resetPassword(email: string): Promise<void> {
    return this.post('/auth/reset-password/', { email });
  }

  async confirmResetPassword(userId: string, resetCode: string, newPassword: string): Promise<void> {
    return this.post('/auth/reset-password/confirm/', {
      user_id: userId,
      reset_code: resetCode,
      new_password: newPassword,
    });
  }

  async getProfile(): Promise<User> {
    return this.get('/auth/profile/');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.put('/auth/profile/', userData);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return this.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }
}

// User service
export class UserService extends ApiService {
  async getUsers(params?: Record<string, any>): Promise<PaginatedResponse<User>> {
    return this.get('/users/', params);
  }

  async getUser(id: number): Promise<User> {
    return this.get(`/users/${id}/`);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.post('/users/', userData);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.put(`/users/${id}/`, userData);
  }

  async deleteUser(id: number): Promise<void> {
    return this.delete(`/users/${id}/`);
  }

  async activateUser(id: number): Promise<User> {
    return this.post(`/users/${id}/activate/`);
  }

  async deactivateUser(id: number): Promise<User> {
    return this.post(`/users/${id}/deactivate/`);
  }
}

// Document service
export class DocumentService extends ApiService {
  async getDocuments(params?: Record<string, any>): Promise<PaginatedResponse<Document>> {
    return this.get('/documents/', params);
  }

  async getDocument(id: number): Promise<Document> {
    return this.get(`/documents/${id}/`);
  }

  async createDocument(documentData: Partial<Document>): Promise<Document> {
    return this.post('/documents/', documentData);
  }

  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document> {
    return this.put(`/documents/${id}/`, documentData);
  }

  async deleteDocument(id: number): Promise<void> {
    return this.delete(`/documents/${id}/`);
  }

  async approveDocument(id: number, comments?: string): Promise<Document> {
    return this.post(`/documents/${id}/approve/`, { comments });
  }

  async rejectDocument(id: number, comments?: string): Promise<Document> {
    return this.post(`/documents/${id}/reject/`, { comments });
  }

  async uploadDocumentFile(id: number, file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    return this.uploadFile(`/documents/${id}/upload/`, formData);
  }

  async searchDocuments(query: string, filters?: Record<string, any>): Promise<PaginatedResponse<Document>> {
    return this.get('/documents/search/', { q: query, ...filters });
  }
}

// PPE service
export class PPEService extends ApiService {
  // PPE Items
  async getPPEItems(params?: Record<string, any>): Promise<PaginatedResponse<PPEItem>> {
    return this.get('/ppe/items/', params);
  }

  async getPPEItem(id: number): Promise<PPEItem> {
    return this.get(`/ppe/items/${id}/`);
  }

  async createPPEItem(itemData: Partial<PPEItem>): Promise<PPEItem> {
    return this.post('/ppe/items/', itemData);
  }

  async updatePPEItem(id: number, itemData: Partial<PPEItem>): Promise<PPEItem> {
    return this.put(`/ppe/items/${id}/`, itemData);
  }

  async deletePPEItem(id: number): Promise<void> {
    return this.delete(`/ppe/items/${id}/`);
  }

  // PPE Inventory
  async getPPEInventory(params?: Record<string, any>): Promise<PaginatedResponse<PPEInventory>> {
    return this.get('/ppe/inventory/', params);
  }

  async getPPEInventoryItem(id: number): Promise<PPEInventory> {
    return this.get(`/ppe/inventory/${id}/`);
  }

  async updatePPEInventory(id: number, inventoryData: Partial<PPEInventory>): Promise<PPEInventory> {
    return this.put(`/ppe/inventory/${id}/`, inventoryData);
  }

  // PPE Purchases
  async getPPEPurchases(params?: Record<string, any>): Promise<PaginatedResponse<PPEPurchase>> {
    return this.get('/ppe/purchases/', params);
  }

  async getPPEPurchase(id: number): Promise<PPEPurchase> {
    return this.get(`/ppe/purchases/${id}/`);
  }

  async createPPEPurchase(purchaseData: Partial<PPEPurchase>): Promise<PPEPurchase> {
    return this.post('/ppe/purchases/', purchaseData);
  }

  async updatePPEPurchase(id: number, purchaseData: Partial<PPEPurchase>): Promise<PPEPurchase> {
    return this.put(`/ppe/purchases/${id}/`, purchaseData);
  }

  async deletePPEPurchase(id: number): Promise<void> {
    return this.delete(`/ppe/purchases/${id}/`);
  }

  // PPE Issuance
  async getPPEIssuances(params?: Record<string, any>): Promise<PaginatedResponse<PPEIssuance>> {
    return this.get('/ppe/issuances/', params);
  }

  async getPPEIssuance(id: number): Promise<PPEIssuance> {
    return this.get(`/ppe/issuances/${id}/`);
  }

  async createPPEIssuance(issuanceData: Partial<PPEIssuance>): Promise<PPEIssuance> {
    return this.post('/ppe/issuances/', issuanceData);
  }

  async updatePPEIssuance(id: number, issuanceData: Partial<PPEIssuance>): Promise<PPEIssuance> {
    return this.put(`/ppe/issuances/${id}/`, issuanceData);
  }

  async returnPPE(id: number, returnData: Partial<PPEIssuance>): Promise<PPEIssuance> {
    return this.post(`/ppe/issuances/${id}/return/`, returnData);
  }

  // PPE Damage Reports
  async getPPEDamageReports(params?: Record<string, any>): Promise<PaginatedResponse<PPEDamageReport>> {
    return this.get('/ppe/damage-reports/', params);
  }

  async getPPEDamageReport(id: number): Promise<PPEDamageReport> {
    return this.get(`/ppe/damage-reports/${id}/`);
  }

  async createPPEDamageReport(reportData: Partial<PPEDamageReport>): Promise<PPEDamageReport> {
    return this.post('/ppe/damage-reports/', reportData);
  }

  async updatePPEDamageReport(id: number, reportData: Partial<PPEDamageReport>): Promise<PPEDamageReport> {
    return this.put(`/ppe/damage-reports/${id}/`, reportData);
  }

  // PPE Vendors
  async getPPEVendors(params?: Record<string, any>): Promise<PaginatedResponse<PPEVendor>> {
    return this.get('/ppe/vendors/', params);
  }

  async getPPEVendor(id: number): Promise<PPEVendor> {
    return this.get(`/ppe/vendors/${id}/`);
  }

  async createPPEVendor(vendorData: Partial<PPEVendor>): Promise<PPEVendor> {
    return this.post('/ppe/vendors/', vendorData);
  }

  async updatePPEVendor(id: number, vendorData: Partial<PPEVendor>): Promise<PPEVendor> {
    return this.put(`/ppe/vendors/${id}/`, vendorData);
  }

  async deletePPEVendor(id: number): Promise<void> {
    return this.delete(`/ppe/vendors/${id}/`);
  }
}

// Legal service
export class LegalService extends ApiService {
  async getLegalDocuments(params?: Record<string, any>): Promise<PaginatedResponse<LegalDocument>> {
    return this.get('/legal/documents/', params);
  }

  async getLegalDocument(id: number): Promise<LegalDocument> {
    return this.get(`/legal/documents/${id}/`);
  }

  async createLegalDocument(documentData: Partial<LegalDocument>): Promise<LegalDocument> {
    return this.post('/legal/documents/', documentData);
  }

  async updateLegalDocument(id: number, documentData: Partial<LegalDocument>): Promise<LegalDocument> {
    return this.put(`/legal/documents/${id}/`, documentData);
  }

  async deleteLegalDocument(id: number): Promise<void> {
    return this.delete(`/legal/documents/${id}/`);
  }

  async getLegislationTrackers(params?: Record<string, any>): Promise<PaginatedResponse<LegislationTracker>> {
    return this.get('/legal/trackers/', params);
  }

  async getLegislationTracker(id: number): Promise<LegislationTracker> {
    return this.get(`/legal/trackers/${id}/`);
  }

  async createLegislationTracker(trackerData: Partial<LegislationTracker>): Promise<LegislationTracker> {
    return this.post('/legal/trackers/', trackerData);
  }

  async updateLegislationTracker(id: number, trackerData: Partial<LegislationTracker>): Promise<LegislationTracker> {
    return this.put(`/legal/trackers/${id}/`, trackerData);
  }

  async deleteLegislationTracker(id: number): Promise<void> {
    return this.delete(`/legal/trackers/${id}/`);
  }
}

// Audit service
export class AuditService extends ApiService {
  async getAudits(params?: Record<string, any>): Promise<PaginatedResponse<Audit>> {
    return this.get('/audits/', params);
  }

  async getAudit(id: number): Promise<Audit> {
    return this.get(`/audits/${id}/`);
  }

  async createAudit(auditData: Partial<Audit>): Promise<Audit> {
    return this.post('/audits/', auditData);
  }

  async updateAudit(id: number, auditData: Partial<Audit>): Promise<Audit> {
    return this.put(`/audits/${id}/`, auditData);
  }

  async deleteAudit(id: number): Promise<void> {
    return this.delete(`/audits/${id}/`);
  }

  async getAuditFindings(auditId: number, params?: Record<string, any>): Promise<PaginatedResponse<AuditFinding>> {
    return this.get(`/audits/${auditId}/findings/`, params);
  }

  async createAuditFinding(auditId: number, findingData: Partial<AuditFinding>): Promise<AuditFinding> {
    return this.post(`/audits/${auditId}/findings/`, findingData);
  }

  async updateAuditFinding(id: number, findingData: Partial<AuditFinding>): Promise<AuditFinding> {
    return this.put(`/audits/findings/${id}/`, findingData);
  }

  async deleteAuditFinding(id: number): Promise<void> {
    return this.delete(`/audits/findings/${id}/`);
  }
}

// Department service
export class DepartmentService extends ApiService {
  async getDepartments(params?: Record<string, any>): Promise<PaginatedResponse<Department>> {
    return this.get('/departments/', params);
  }

  async getDepartment(id: number): Promise<Department> {
    return this.get(`/departments/${id}/`);
  }

  async createDepartment(departmentData: Partial<Department>): Promise<Department> {
    return this.post('/departments/', departmentData);
  }

  async updateDepartment(id: number, departmentData: Partial<Department>): Promise<Department> {
    return this.put(`/departments/${id}/`, departmentData);
  }

  async deleteDepartment(id: number): Promise<void> {
    return this.delete(`/departments/${id}/`);
  }
}

// System settings service
export class SystemSettingsService extends ApiService {
  async getSystemSettings(): Promise<SystemSettings> {
    return this.get('/system/settings/');
  }

  async updateSystemSettings(settingsData: Partial<SystemSettings>): Promise<SystemSettings> {
    return this.put('/system/settings/', settingsData);
  }

  async getHealthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health/');
  }
}

// Notification service
export class NotificationService extends ApiService {
  async getNotifications(params?: Record<string, any>): Promise<PaginatedResponse<Notification>> {
    return this.get('/notifications/', params);
  }

  async markAsRead(id: number): Promise<Notification> {
    return this.post(`/notifications/${id}/read/`);
  }

  async markAllAsRead(): Promise<void> {
    return this.post('/notifications/mark-all-read/');
  }

  async deleteNotification(id: number): Promise<void> {
    return this.delete(`/notifications/${id}/`);
  }
}

// Export service instances
export const authService = new AuthService();
export const userService = new UserService();
export const documentService = new DocumentService();
export const ppeService = new PPEService();
export const legalService = new LegalService();
export const auditService = new AuditService();
export const departmentService = new DepartmentService();
export const systemSettingsService = new SystemSettingsService();
export const notificationService = new NotificationService();

// Export all services as a single object for convenience
export const apiServices = {
  auth: authService,
  users: userService,
  documents: documentService,
  ppe: ppeService,
  legal: legalService,
  audits: auditService,
  departments: departmentService,
  system: systemSettingsService,
  notifications: notificationService,
};
