/* ============================================================
   MedFA API Client
   Source: Architecture.md §5 — API Contract
   ============================================================ */

import type {
  DiagnosisRequest,
  DiagnosisResponse,
  Condition,
  SymptomMeta,
  HealthResponse,
  FuzzyRule,
  Session,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api/v1";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE}${API_PREFIX}`;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiRequestError(
          errorData?.error?.message || `Request failed: ${response.status}`,
          response.status,
          errorData?.error?.code || "UNKNOWN_ERROR"
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiRequestError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiRequestError(
          "Request timed out. Please try again.",
          408,
          "TIMEOUT"
        );
      }
      throw new ApiRequestError(
        "Unable to connect to the server. Please check your connection.",
        0,
        "NETWORK_ERROR"
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  // ── Health ──
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health");
  }

  // ── Diagnosis ──
  async evaluate(request: DiagnosisRequest): Promise<DiagnosisResponse> {
    return this.request<DiagnosisResponse>("/diagnoses/evaluate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // ── Conditions ──
  async getConditions(): Promise<Condition[]> {
    return this.request<Condition[]>("/conditions");
  }

  // ── Symptoms ──
  async getSymptoms(): Promise<SymptomMeta[]> {
    return this.request<SymptomMeta[]>("/symptoms");
  }

  // ── Rules (Admin) ──
  async getRules(): Promise<FuzzyRule[]> {
    return this.request<FuzzyRule[]>("/rules");
  }

  async updateRule(ruleId: string, data: Partial<FuzzyRule>): Promise<FuzzyRule> {
    return this.request<FuzzyRule>(`/rules/${ruleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ── Sessions ──
  async saveSession(sessionData: Record<string, unknown>): Promise<Session> {
    return this.request<Session>("/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    });
  }

  async getSession(sessionId: string): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}`);
  }
}

// ── Custom Error Class ──
export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

// ── Singleton Export ──
export const api = new ApiClient();
