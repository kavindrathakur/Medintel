"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Hash } from "lucide-react";
import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";
import { getConfidenceLevel, getConfidenceLabel, type DiagnosisResult } from "@/lib/types";

interface DiagnosisCardProps {
  diagnosis: DiagnosisResult;
  index: number;
}

export default function DiagnosisCard({ diagnosis, index }: DiagnosisCardProps) {
  const [expanded, setExpanded] = useState(false);
  const level = getConfidenceLevel(diagnosis.confidence_percent);
  const levelLabel = getConfidenceLabel(level);

  return (
    <Card id={`diagnosis-${diagnosis.condition_id}`} className="diagnosis-card">
      <div className="diagnosis-header">
        <div className="diagnosis-rank">
          <Hash size={14} />
          <span>{index + 1}</span>
        </div>
        <div className="diagnosis-info">
          <h3 className="diagnosis-name">{diagnosis.condition_name}</h3>
          {diagnosis.description && (
            <p className="diagnosis-desc">{diagnosis.description}</p>
          )}
          {diagnosis.category && (
            <span className="diagnosis-category">{diagnosis.category}</span>
          )}
        </div>
        <div className={`diagnosis-badge confidence-${level}`}>
          {levelLabel}
        </div>
      </div>

      <div className="diagnosis-bar">
        <ProgressBar value={diagnosis.confidence_percent} />
      </div>

      <button
        type="button"
        className="why-button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`contributors-${diagnosis.condition_id}`}
      >
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        <span>Why this result?</span>
      </button>

      {expanded && (
        <div
          id={`contributors-${diagnosis.condition_id}`}
          className="contributors-panel animate-fade-in"
          role="region"
          aria-label={`Symptom contributors for ${diagnosis.condition_name}`}
        >
          <h4 className="contributors-title">Symptom Contributors</h4>
          {diagnosis.contributors.length > 0 ? (
            <ul className="contributors-list">
              {diagnosis.contributors.map((c) => (
                <li key={c.symptom} className="contributor-item">
                  <span className="contributor-name">{c.symptom.replace(/_/g, " ")}</span>
                  <div className="contributor-bar-wrap">
                    <div
                      className="contributor-bar"
                      style={{ width: `${Math.min(c.contribution * 100, 100)}%` }}
                    />
                  </div>
                  <span className="contributor-value">{c.contribution.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-contributors">
              No specific symptom contributors identified for this condition.
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        .diagnosis-card {
          animation: slideUp var(--transition-slow) ease forwards;
          animation-delay: ${index * 80}ms;
          opacity: 0;
        }
        .diagnosis-header {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }
        .diagnosis-rank {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 14px;
          font-weight: 700;
          color: var(--primary-700);
          background: var(--primary-100);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--pill-radius);
          white-space: nowrap;
        }
        .diagnosis-info {
          flex: 1;
        }
        .diagnosis-name {
          font-size: 18px;
          line-height: 26px;
          font-weight: 600;
          color: var(--neutral-950);
          margin: 0;
        }
        .diagnosis-desc {
          font-size: 14px;
          color: var(--neutral-700);
          margin-top: 2px;
        }
        .diagnosis-category {
          display: inline-block;
          font-size: 11px;
          font-weight: 500;
          color: var(--neutral-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: var(--space-1);
        }
        .diagnosis-badge {
          font-size: 12px;
          font-weight: 600;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--pill-radius);
          white-space: nowrap;
        }
        .confidence-higher {
          background: var(--success-bg);
          color: var(--success);
        }
        .confidence-moderate {
          background: var(--warning-bg);
          color: var(--warning);
        }
        .confidence-lower {
          background: var(--neutral-100);
          color: var(--neutral-500);
        }
        .diagnosis-bar {
          margin-bottom: var(--space-3);
        }
        .why-button {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: none;
          border: none;
          padding: var(--space-2) 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-700);
          cursor: pointer;
          font-family: var(--font-sans);
          transition: opacity var(--transition-fast);
        }
        .why-button:hover {
          opacity: 0.8;
        }
        .contributors-panel {
          margin-top: var(--space-3);
          padding-top: var(--space-3);
          border-top: 1px solid var(--neutral-300);
        }
        .contributors-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--neutral-700);
          margin-bottom: var(--space-3);
        }
        .contributors-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .contributor-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .contributor-name {
          font-size: 13px;
          color: var(--neutral-700);
          min-width: 120px;
          text-transform: capitalize;
        }
        .contributor-bar-wrap {
          flex: 1;
          height: 6px;
          background: var(--neutral-100);
          border-radius: var(--pill-radius);
          overflow: hidden;
        }
        .contributor-bar {
          height: 100%;
          background: var(--primary-600);
          border-radius: var(--pill-radius);
          transition: width var(--transition-normal);
        }
        .contributor-value {
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-mono);
          color: var(--neutral-700);
          min-width: 36px;
          text-align: right;
        }
        .no-contributors {
          font-size: 13px;
          color: var(--neutral-500);
          font-style: italic;
        }
      `}</style>
    </Card>
  );
}
