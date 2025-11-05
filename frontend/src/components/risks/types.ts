export interface RiskAssessment {
  id: string;
  event_number: string;
  status: string;
  location: string;
  process_area: string;
  risk_category: string;
  activity_type: string;
  assessed_by_name: string;
  risk_owner_name: string;
  assessment_date: string;
  next_review_date: string;
  initial_risk_level: number;
  residual_risk_level: number;
  initial_risk_rating: string;
  residual_risk_rating: string;
  initial_risk_color: string;
  residual_risk_color: string;
  risk_acceptable: boolean;
  is_overdue_for_review: boolean;
  hazard_count: number;
  barrier_count: number;
}

export interface MatrixConfig {
  matrix_size: number;
  probability_definitions: { [key: string]: any };
  severity_definitions: { [key: string]: any };
  low_threshold: number;
  medium_threshold: number;
  low_risk_color: string;
  medium_risk_color: string;
  high_risk_color: string;
}

export interface DashboardData {
  total_assessments: number;
  active_assessments: number;
  risk_distribution: { low: number; medium: number; high: number };
  overdue_reviews: number;
  by_category: { [key: string]: number };
  pending_actions: number;
  overdue_actions: number;
}


