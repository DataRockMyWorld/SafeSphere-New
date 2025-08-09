// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// User Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  position: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

export interface UserProfile extends User {
  avatar?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  position: string;
  department?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Document Types
export interface Document {
  id: number;
  title: string;
  content: string;
  document_type: 'policy' | 'procedure' | 'form' | 'manual' | 'other';
  status: 'draft' | 'review' | 'approved' | 'archived';
  version: string;
  created_by: User;
  created_at: string;
  updated_at: string;
  approved_by?: User;
  approved_at?: string;
  department?: string;
  tags: string[];
  file_url?: string;
  file_size?: number;
  file_type?: string;
}

export interface DocumentChangeRequest {
  id: number;
  document: Document;
  requested_by: User;
  requested_at: string;
  reason: string;
  changes: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: User;
  reviewed_at?: string;
  comments?: string;
}

export interface DocumentApproval {
  id: number;
  document: Document;
  approver: User;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  created_at: string;
  updated_at: string;
}

// Legal Types
export interface LegalDocument {
  id: number;
  title: string;
  description: string;
  category: 'regulation' | 'law' | 'standard' | 'guideline';
  jurisdiction: string;
  effective_date: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'pending';
  document_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LegislationTracker {
  id: number;
  title: string;
  description: string;
  status: 'tracking' | 'implemented' | 'compliant' | 'non-compliant';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  compliance_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// PPE Types
export interface PPEItem {
  id: number;
  name: string;
  description: string;
  category: 'head' | 'eye' | 'hearing' | 'respiratory' | 'hand' | 'foot' | 'body' | 'fall_protection';
  manufacturer: string;
  model: string;
  size?: string;
  color?: string;
  material?: string;
  standards: string[];
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PPEInventory {
  id: number;
  item: PPEItem;
  quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  minimum_stock: number;
  maximum_stock: number;
  location: string;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  last_updated: string;
}

export interface PPEPurchase {
  id: number;
  item: PPEItem;
  quantity: number;
  unit_price: number;
  total_price: number;
  vendor: string;
  purchase_date: string;
  expected_delivery: string;
  actual_delivery?: string;
  status: 'pending' | 'ordered' | 'delivered' | 'cancelled';
  receipt_document?: string;
  notes?: string;
  created_by: User;
  created_at: string;
  updated_at: string;
}

export interface PPEIssuance {
  id: number;
  item: PPEInventory;
  employee: User;
  quantity: number;
  issued_by: User;
  issued_at: string;
  expected_return?: string;
  actual_return?: string;
  condition_issued: 'new' | 'good' | 'fair';
  condition_returned?: 'good' | 'fair' | 'poor' | 'damaged';
  notes?: string;
  status: 'issued' | 'returned' | 'overdue';
}

export interface PPEDamageReport {
  id: number;
  item: PPEItem;
  employee: User;
  damage_date: string;
  damage_type: 'wear' | 'accident' | 'manufacturing' | 'other';
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  reported_at: string;
  investigated_by?: User;
  investigation_date?: string;
  investigation_notes?: string;
  status: 'reported' | 'investigating' | 'resolved';
  resolution?: string;
}

export interface PPEVendor {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Audit Types
export interface Audit {
  id: number;
  title: string;
  description: string;
  audit_type: 'internal' | 'external' | 'compliance' | 'safety';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  auditor: User;
  auditee: User;
  department: string;
  findings: AuditFinding[];
  created_at: string;
  updated_at: string;
}

export interface AuditFinding {
  id: number;
  audit: Audit;
  finding_type: 'observation' | 'non_conformity' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requirement?: string;
  evidence?: string;
  corrective_action?: string;
  due_date?: string;
  status: 'open' | 'in_progress' | 'closed';
  assigned_to?: User;
  created_at: string;
  updated_at: string;
}

// Performance Types
export interface PerformanceMetric {
  id: number;
  name: string;
  description: string;
  category: 'safety' | 'compliance' | 'efficiency' | 'quality';
  unit: string;
  target_value: number;
  current_value: number;
  measurement_date: string;
  trend: 'improving' | 'stable' | 'declining';
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: number;
  user: User;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'document' | 'ppe' | 'audit' | 'legal';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  submitText: string;
  cancelText?: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// UI Types
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  permission?: string;
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

// Filter Types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  field: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'number';
  options?: FilterOption[];
  placeholder?: string;
}

// Search Types
export interface SearchParams {
  query: string;
  filters: Record<string, any>;
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  page: number;
  pageSize: number;
}

// Export Types
export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf';
  filename: string;
  includeHeaders: boolean;
  dateFormat?: string;
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData;
  options?: any;
}

// Permission Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Department Types
export interface Department {
  id: number;
  name: string;
  description?: string;
  manager?: User;
  employees: User[];
  created_at: string;
  updated_at: string;
}

// Settings Types
export interface SystemSettings {
  id: number;
  site_name: string;
  site_description?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  logo_url?: string;
  favicon_url?: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_verification_required: boolean;
  sms_verification_required: boolean;
  session_timeout: number;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special_chars: boolean;
  };
  created_at: string;
  updated_at: string;
}

// File Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// Theme Types
export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

// API Endpoint Types
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters?: ApiParameter[];
  responses?: ApiResponse[];
}

export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: any;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortDirection = 'asc' | 'desc';

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

// Generic Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}; 