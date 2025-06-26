export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  get_full_name: string;
}

export interface DocumentTemplate {
  id: number;
  name: string;
  description: string;
  document_type: string;
  department: string;
  version: string;
  is_active: boolean;
  sections: Record<string, any>;
  required_fields: string[];
  validation_rules: Record<string, any>;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  document_count: number;
}

export interface TemplateFormData {
  title: string;
  description: string;
  content: string;
  tags: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
} 