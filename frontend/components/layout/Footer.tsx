"use client";

import { MEDICAL_DISCLAIMER } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container footer-inner">
        <p className="footer-disclaimer">{MEDICAL_DISCLAIMER}</p>
        <div className="footer-meta">
          <span>MedFA v1.0</span>
          <span className="footer-dot">·</span>
          <span>No personal data collected</span>
          <span className="footer-dot">·</span>
          <span>Research prototype</span>
        </div>
      </div>

      <style jsx>{`
        .app-footer {
          margin-top: auto;
          border-top: 1px solid var(--neutral-300);
          background: var(--white);
          padding: var(--space-6) 0;
        }
        .footer-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          text-align: center;
        }
        .footer-disclaimer {
          font-size: 12px;
          line-height: 16px;
          color: var(--neutral-500);
          max-width: 600px;
        }
        .footer-meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 12px;
          color: var(--neutral-500);
        }
        .footer-dot {
          opacity: 0.4;
        }
      `}</style>
    </footer>
  );
}
