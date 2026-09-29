/* ============================================================
   MedFA TypeScript Types
   Source: Architecture.md §5-6, PRD.md §4
   ============================================================ */

// ── Demographics ──
export interface Demographics {
  age?: number;
  sex?: "male" | "female" | "other";
  risk_factors?: string[];
}

// ── Diagnosis Request ──
export interface DiagnosisRequest {
  demographics?: Demographics;
  symptoms: Record<string, number | null>;
  composition_method?: "max_min" | "max_product";
}

// ── Contributor ──
export interface Contributor {
  symptom: string;
  contribution: number;
}

// ── Single Diagnosis Result ──
export interface DiagnosisResult {
  condition_id: string;
  condition_name: string;
  description?: string;
  category?: string;
  confidence: number;
  confidence_percent: number;
  confidence_label: string;
  rank: number;
  contributors: Contributor[];
}

// ── Data Completeness ──
export interface DataCompleteness {
  total_symptoms: number;
  provided_count: number;
  missing_count: number;
  completeness_percent: number;
}

// ── Full Diagnosis Response ──
export interface DiagnosisResponse {
  session_id: string;
  diagnoses: DiagnosisResult[];
  warnings: string[];
  missing_symptom_count: number;
  data_completeness: DataCompleteness;
  composition_method: string;
  rule_base_version: string;
  insufficient_evidence: boolean;
  fuzzified_inputs: Record<string, Record<string, number | null>>;
}

// ── Condition ──
export interface Condition {
  condition_id: string;
  name: string;
  description: string;
  category: string;
}

// ── Symptom Metadata ──
export interface SymptomMeta {
  symptom_id: string;
  label: string;
  input_type: "slider" | "toggle" | "numeric";
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  group: string;
  description?: string;
}

// ── Fuzzy Rule ──
export interface FuzzyRule {
  rule_id: string;
  symptom_id: string;
  fuzzy_label: string;
  source_state: string;
  target_state: string;
  weight: number;
  source: string;
  status: "research_only" | "validated";
  version?: string;
}

// ── Session ──
export interface Session {
  session_id: string;
  created_at: string;
  top_diagnosis?: string;
  confidence?: number;
  symptom_count?: number;
}

// ── Health Check ──
export interface HealthResponse {
  status: string;
  version: string;
  conditions_loaded: number;
  rule_base_version: string;
}

// ── API Error ──
export interface ApiError {
  error: {
    code: string;
    message: string;
    details: string[];
  };
}

// ── Confidence Level Helpers ──
export type ConfidenceLevel = "higher" | "moderate" | "lower";

export function getConfidenceLevel(percent: number): ConfidenceLevel {
  if (percent >= 70) return "higher";
  if (percent >= 40) return "moderate";
  return "lower";
}

export function getConfidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case "higher": return "Higher relevance";
    case "moderate": return "Moderate relevance";
    case "lower": return "Lower relevance";
  }
}
