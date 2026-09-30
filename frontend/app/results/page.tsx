"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, FileWarning, BarChart3 } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DiagnosisCard from "@/components/diagnosis/DiagnosisCard";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";
import type { DiagnosisResponse } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("medfa_result");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        // Invalid data
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="results-page">
        <div className="container reading-width">
          <div className="loading-state">
            <BarChart3 size={32} className="animate-pulse-subtle" />
            <p>Loading results…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-page">
        <div className="container reading-width">
          <div className="empty-state">
            <FileWarning size={48} strokeWidth={1.2} />
            <h2>No results available</h2>
            <p>
              Please complete a symptom assessment first to view possible
              conditions.
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/")}
              icon={<ArrowLeft size={18} />}
            >
              Start new assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasRedFlags = result.warnings.some(
    (w) =>
      w.toLowerCase().includes("emergency") ||
      w.toLowerCase().includes("seek") ||
      w.toLowerCase().includes("urgent")
  );

  const routineWarnings = result.warnings.filter(
    (w) =>
      !w.toLowerCase().includes("emergency") &&
      !w.toLowerCase().includes("seek emergency") &&
      !w.toLowerCase().includes("urgent")
  );

  const emergencyWarnings = result.warnings.filter(
    (w) =>
      w.toLowerCase().includes("emergency") ||
      w.toLowerCase().includes("seek") ||
      w.toLowerCase().includes("urgent")
  );

  // Save to local session history
  useEffect(() => {
    if (result) {
      try {
        const history = JSON.parse(
          localStorage.getItem("medfa_history") || "[]"
        );
        const entry = {
          session_id: result.session_id,
          created_at: new Date().toISOString(),
          top_diagnosis: result.diagnoses[0]?.condition_name || "Unknown",
          confidence: result.diagnoses[0]?.confidence_percent || 0,
          symptom_count:
            (result.data_completeness?.provided_count || 0),
        };
        // Avoid duplicates
        if (!history.find((h: { session_id: string }) => h.session_id === result.session_id)) {
          history.unshift(entry);
          localStorage.setItem(
            "medfa_history",
            JSON.stringify(history.slice(0, 50))
          );
        }
      } catch {
        // localStorage unavailable
      }
    }
  }, [result]);

  return (
    <div className="results-page">
      <div className="container reading-width">
        <h1>Possible conditions</h1>
        <p className="results-subtitle">
          Based on the information entered, these conditions may be relevant.
          Results are ordered by relevance score.
        </p>

        {/* Medical disclaimer — always visible */}
        <Alert variant="info" id="results-disclaimer">
          {MEDICAL_DISCLAIMER}
        </Alert>

        {/* Emergency warnings — shown FIRST before all results */}
        {hasRedFlags && (
          <div className="red-flag-section" role="alert">
            {emergencyWarnings.map((w, i) => (
              <Alert key={i} variant="danger" id={`red-flag-${i}`}>
                <div className="red-flag-content">
                  <AlertCircle size={20} />
                  <strong>{w}</strong>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Data completeness panel */}
        <Card id="completeness-panel" className="completeness-card">
          <div className="completeness-header">
            <h3>Input completeness</h3>
            <span className="completeness-badge">
              {result.data_completeness?.completeness_percent || 0}% provided
            </span>
          </div>
          <div className="completeness-details">
            <span>
              {result.data_completeness?.provided_count || 0} of{" "}
              {result.data_completeness?.total_symptoms || 0} symptoms provided
            </span>
            {result.missing_symptom_count > 0 && (
              <span className="missing-note">
                · {result.missing_symptom_count} fields not provided — results
                carry additional uncertainty
              </span>
            )}
          </div>
        </Card>

        {/* Insufficient evidence */}
        {result.insufficient_evidence && (
          <Alert variant="warning" id="insufficient-evidence">
            <strong>Limited information available.</strong> The symptoms provided
            may not be sufficient for meaningful differentiation. Consider
            providing additional symptom information.
          </Alert>
        )}

        {/* Diagnosis cards */}
        <div
          className="diagnoses-list"
          aria-live="polite"
          aria-label="Diagnosis results"
        >
          {result.diagnoses.map((diag, index) => (
            <DiagnosisCard
              key={diag.condition_id}
              diagnosis={diag}
              index={index}
            />
          ))}
        </div>

        {/* Metadata footer */}
        <div className="results-meta">
          <span className="text-caption">
            Session: {result.session_id.slice(0, 8)}…
          </span>
          <span className="text-caption">
            Composition: {result.composition_method}
          </span>
          <span className="text-caption">
            Rule base: v{result.rule_base_version}
          </span>
        </div>

        {/* Actions */}
        <div className="results-actions">
          <Button
            variant="primary"
            onClick={() => router.push("/")}
            icon={<ArrowLeft size={18} />}
          >
            Start a new assessment
          </Button>
        </div>
      </div>

      <style jsx>{`
        .results-page {
          padding: var(--space-8) 0 var(--space-12);
        }
        .results-page h1 {
          margin-bottom: var(--space-2);
        }
        .results-subtitle {
          font-size: 16px;
          color: var(--neutral-700);
          margin-bottom: var(--space-4);
        }
        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-12) 0;
          gap: var(--space-4);
          text-align: center;
          color: var(--neutral-500);
        }
        .empty-state h2 {
          color: var(--neutral-700);
        }
        .empty-state p {
          max-width: 400px;
          color: var(--neutral-500);
        }
        .red-flag-section {
          margin-top: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .red-flag-content {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .completeness-card {
          margin-top: var(--space-4);
        }
        .completeness-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .completeness-header h3 {
          margin: 0;
        }
        .completeness-badge {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary-700);
          background: var(--primary-100);
          padding: 2px 10px;
          border-radius: var(--pill-radius);
        }
        .completeness-details {
          font-size: 13px;
          color: var(--neutral-500);
          margin-top: var(--space-2);
        }
        .missing-note {
          color: var(--warning);
        }
        .diagnoses-list {
          margin-top: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .results-meta {
          display: flex;
          justify-content: center;
          gap: var(--space-4);
          margin-top: var(--space-6);
          padding-top: var(--space-4);
          border-top: 1px solid var(--neutral-300);
          flex-wrap: wrap;
        }
        .results-actions {
          display: flex;
          justify-content: center;
          margin-top: var(--space-6);
        }
      `}</style>
    </div>
  );
}
