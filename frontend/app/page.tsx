"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Wind,
  Heart,
  Utensils,
  Brain,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SliderInput from "@/components/symptoms/SliderInput";
import ToggleInput from "@/components/symptoms/ToggleInput";
import NumericInput from "@/components/symptoms/NumericInput";
import { MEDICAL_DISCLAIMER, DEFAULT_SYMPTOMS, SYMPTOM_GROUPS } from "@/lib/constants";
import { api, ApiRequestError } from "@/lib/api";
import type { DiagnosisResponse } from "@/lib/types";

const groupIcons: Record<string, typeof Activity> = {
  general: Activity,
  respiratory: Wind,
  cardiac: Heart,
  digestive: Utensils,
  neurological: Brain,
};

export default function SymptomIntakePage() {
  const router = useRouter();
  const [activeGroup, setActiveGroup] = useState("general");
  const [values, setValues] = useState<Record<string, number | null>>({});
  const [demographics, setDemographics] = useState<{
    age?: number;
    sex?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValueChange = useCallback((symptomId: string, value: number | null) => {
    setValues((prev) => ({
      ...prev,
      [symptomId]: value,
    }));
  }, []);

  const filledCount = Object.values(values).filter((v) => v !== null && v !== undefined).length;
  const totalCount = DEFAULT_SYMPTOMS.length;
  const completionPercent = Math.round((filledCount / totalCount) * 100);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const symptomPayload: Record<string, number | null> = {};
      for (const sym of DEFAULT_SYMPTOMS) {
        symptomPayload[sym.symptom_id] = values[sym.symptom_id] ?? null;
      }

      const response: DiagnosisResponse = await api.evaluate({
        demographics: {
          age: demographics.age,
          sex: demographics.sex as "male" | "female" | "other" | undefined,
        },
        symptoms: symptomPayload,
        composition_method: "max_min",
      });

      // Store results in sessionStorage for the results page
      sessionStorage.setItem("medfa_result", JSON.stringify(response));
      sessionStorage.setItem("medfa_symptoms", JSON.stringify(values));
      router.push("/results");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  const groupSymptoms = DEFAULT_SYMPTOMS.filter(
    (s) => s.group === activeGroup
  );

  return (
    <div className="intake-page">
      <div className="container reading-width">
        {/* Hero */}
        <div className="intake-hero">
          <Stethoscope size={36} strokeWidth={1.5} className="hero-icon" />
          <h1>Tell us about the symptoms</h1>
          <p className="hero-subtitle">
            Enter the symptoms you are experiencing. You do not need to fill in
            every field — unanswered fields are treated as unknown, not absent.
          </p>
        </div>

        {/* Disclaimer */}
        <Alert variant="info" id="disclaimer-alert">
          {MEDICAL_DISCLAIMER}
        </Alert>

        {/* Demographics (optional) */}
        <Card className="demographics-card">
          <h3>Demographics <span className="optional-badge">Optional</span></h3>
          <div className="demographics-fields">
            <div className="demo-field">
              <label htmlFor="demo-age" className="text-label">Age range</label>
              <select
                id="demo-age"
                className="demo-select"
                value={demographics.age || ""}
                onChange={(e) =>
                  setDemographics((p) => ({
                    ...p,
                    age: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
              >
                <option value="">Not specified</option>
                <option value="15">Under 18</option>
                <option value="25">18–30</option>
                <option value="40">31–50</option>
                <option value="60">51–70</option>
                <option value="75">Over 70</option>
              </select>
            </div>
            <div className="demo-field">
              <label htmlFor="demo-sex" className="text-label">Sex</label>
              <select
                id="demo-sex"
                className="demo-select"
                value={demographics.sex || ""}
                onChange={(e) =>
                  setDemographics((p) => ({
                    ...p,
                    sex: e.target.value || undefined,
                  }))
                }
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Progress indicator */}
        <div className="progress-indicator">
          <div className="progress-text">
            <span>{filledCount} of {totalCount} symptoms provided</span>
            <span className="text-caption">{completionPercent}% complete</span>
          </div>
          <div className="progress-track-sm">
            <div
              className="progress-fill-sm"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Symptom Group Tabs */}
        <div className="group-tabs" role="tablist" aria-label="Symptom groups">
          {SYMPTOM_GROUPS.map((group) => {
            const Icon = groupIcons[group.id] || Activity;
            const isActive = activeGroup === group.id;
            const groupFilled = DEFAULT_SYMPTOMS.filter(
              (s) => s.group === group.id && values[s.symptom_id] != null
            ).length;
            const groupTotal = DEFAULT_SYMPTOMS.filter(
              (s) => s.group === group.id
            ).length;

            return (
              <button
                key={group.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${group.id}`}
                className={`group-tab ${isActive ? "group-tab-active" : ""}`}
                onClick={() => setActiveGroup(group.id)}
              >
                <Icon size={18} />
                <span className="tab-label">{group.label}</span>
                {groupFilled > 0 && (
                  <span className="tab-count">
                    {groupFilled}/{groupTotal}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Symptom Input Panel */}
        <Card id={`panel-${activeGroup}`} className="symptoms-panel">
          {groupSymptoms.map((symptom) => {
            const value = values[symptom.symptom_id] ?? null;

            if (symptom.input_type === "slider") {
              return (
                <SliderInput
                  key={symptom.symptom_id}
                  id={symptom.symptom_id}
                  label={symptom.label}
                  description={symptom.description}
                  value={value}
                  onChange={(v) => handleValueChange(symptom.symptom_id, v)}
                  min={symptom.min}
                  max={symptom.max}
                  step={symptom.step}
                />
              );
            }

            if (symptom.input_type === "toggle") {
              return (
                <ToggleInput
                  key={symptom.symptom_id}
                  id={symptom.symptom_id}
                  label={symptom.label}
                  description={symptom.description}
                  value={value}
                  onChange={(v) => handleValueChange(symptom.symptom_id, v)}
                />
              );
            }

            if (symptom.input_type === "numeric") {
              return (
                <NumericInput
                  key={symptom.symptom_id}
                  id={symptom.symptom_id}
                  label={symptom.label}
                  description={symptom.description}
                  value={value}
                  onChange={(v) => handleValueChange(symptom.symptom_id, v)}
                  min={symptom.min}
                  max={symptom.max}
                  step={symptom.step}
                  unit={symptom.unit}
                />
              );
            }

            return null;
          })}
        </Card>

        {/* Missing data reassurance */}
        <p className="missing-reassurance">
          It is okay to leave fields blank. Unanswered symptoms carry additional
          uncertainty but will not produce false results.
        </p>

        {/* Error */}
        {error && (
          <Alert variant="danger" id="submit-error">
            <strong>Error: </strong>{error}
          </Alert>
        )}

        {/* Submit */}
        <div className="submit-area">
          <Button
            variant="primary"
            loading={loading}
            icon={<Stethoscope size={18} />}
            onClick={handleSubmit}
            id="analyze-button"
          >
            {loading ? "Analyzing symptom pattern…" : "Analyze symptoms"}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .intake-page {
          padding: var(--space-8) 0 var(--space-12);
        }
        .intake-hero {
          text-align: center;
          margin-bottom: var(--space-6);
        }
        .intake-hero h1 {
          margin-top: var(--space-3);
          margin-bottom: var(--space-2);
        }
        .hero-subtitle {
          font-size: 16px;
          color: var(--neutral-700);
          max-width: 500px;
          margin: 0 auto;
        }
        .demographics-card {
          margin-top: var(--space-6);
        }
        .demographics-card h3 {
          margin-bottom: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .optional-badge {
          font-size: 11px;
          font-weight: 500;
          color: var(--neutral-500);
          background: var(--neutral-100);
          padding: 2px 8px;
          border-radius: var(--pill-radius);
        }
        .demographics-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        .demo-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .demo-select {
          min-height: 44px;
          padding: 0 var(--space-3);
          border: 1px solid var(--neutral-300);
          border-radius: var(--button-radius);
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--neutral-950);
          background: var(--white);
          cursor: pointer;
        }
        .demo-select:focus {
          border-color: var(--primary-700);
          outline: none;
          box-shadow: 0 0 0 3px var(--primary-100);
        }
        .progress-indicator {
          margin-top: var(--space-6);
          margin-bottom: var(--space-4);
        }
        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 500;
          color: var(--neutral-700);
          margin-bottom: var(--space-2);
        }
        .progress-track-sm {
          height: 4px;
          background: var(--neutral-100);
          border-radius: var(--pill-radius);
          overflow: hidden;
        }
        .progress-fill-sm {
          height: 100%;
          background: var(--primary-700);
          border-radius: var(--pill-radius);
          transition: width var(--transition-normal);
        }
        .group-tabs {
          display: flex;
          gap: var(--space-1);
          margin-bottom: var(--space-4);
          overflow-x: auto;
          padding-bottom: var(--space-1);
        }
        .group-tab {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border: 1.5px solid var(--neutral-300);
          border-radius: var(--pill-radius);
          background: var(--white);
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          color: var(--neutral-700);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }
        .group-tab:hover {
          border-color: var(--primary-600);
          color: var(--primary-700);
        }
        .group-tab-active {
          background: var(--primary-700);
          border-color: var(--primary-700);
          color: var(--white);
        }
        .tab-count {
          font-size: 11px;
          font-weight: 600;
          background: rgba(255,255,255,0.25);
          padding: 1px 6px;
          border-radius: var(--pill-radius);
        }
        .group-tab-active .tab-count {
          background: rgba(255,255,255,0.3);
        }
        .symptoms-panel {
          margin-bottom: var(--space-4);
        }
        .symptoms-panel > :global(div + div) {
          border-top: 1px solid var(--neutral-100);
        }
        .missing-reassurance {
          font-size: 13px;
          color: var(--neutral-500);
          text-align: center;
          margin-bottom: var(--space-6);
        }
        .submit-area {
          display: flex;
          justify-content: center;
          margin-top: var(--space-4);
        }
        @media (max-width: 639px) {
          .demographics-fields {
            grid-template-columns: 1fr;
          }
          .tab-label { display: none; }
        }
      `}</style>
    </div>
  );
}
