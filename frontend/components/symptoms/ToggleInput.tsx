"use client";

interface ToggleInputProps {
  id: string;
  label: string;
  description?: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function ToggleInput({
  id,
  label,
  description,
  value,
  onChange,
}: ToggleInputProps) {
  const state: "present" | "not_present" | "unknown" =
    value === null ? "unknown" : value >= 0.5 ? "present" : "not_present";

  return (
    <div className="toggle-group">
      <div className="toggle-info">
        <span className="toggle-label">{label}</span>
        {description && <p className="toggle-description">{description}</p>}
      </div>
      <fieldset className="toggle-options" aria-label={label}>
        <legend className="sr-only">{label}</legend>
        <button
          id={`${id}-present`}
          type="button"
          className={`toggle-btn ${state === "present" ? "toggle-btn-active" : ""}`}
          onClick={() => onChange(1.0)}
          aria-pressed={state === "present"}
        >
          Present
        </button>
        <button
          id={`${id}-absent`}
          type="button"
          className={`toggle-btn ${state === "not_present" ? "toggle-btn-active toggle-btn-absent" : ""}`}
          onClick={() => onChange(0.0)}
          aria-pressed={state === "not_present"}
        >
          Not present
        </button>
        {state !== "unknown" && (
          <button
            type="button"
            className="toggle-clear"
            onClick={() => onChange(null)}
            aria-label={`Clear ${label}`}
          >
            ×
          </button>
        )}
      </fieldset>

      <style jsx>{`
        .toggle-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) 0;
          gap: var(--space-4);
        }
        .toggle-info {
          flex: 1;
        }
        .toggle-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--neutral-950);
        }
        .toggle-description {
          font-size: 12px;
          color: var(--neutral-500);
          margin-top: 2px;
        }
        .toggle-options {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          border: none;
          padding: 0;
          margin: 0;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
        }
        .toggle-btn {
          padding: var(--space-1) var(--space-3);
          border: 1.5px solid var(--neutral-300);
          border-radius: var(--pill-radius);
          font-size: 13px;
          font-weight: 500;
          color: var(--neutral-700);
          background: var(--white);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
          min-height: 32px;
        }
        .toggle-btn:hover {
          border-color: var(--primary-600);
          color: var(--primary-700);
        }
        .toggle-btn-active {
          background: var(--primary-700);
          border-color: var(--primary-700);
          color: var(--white);
        }
        .toggle-btn-active:hover {
          color: var(--white);
          background: var(--primary-600);
        }
        .toggle-btn-absent {
          background: var(--neutral-100);
          border-color: var(--neutral-300);
          color: var(--neutral-700);
        }
        .toggle-btn-absent:hover {
          background: var(--neutral-300);
          color: var(--neutral-950);
        }
        .toggle-clear {
          width: 24px;
          height: 24px;
          border: none;
          background: none;
          color: var(--neutral-500);
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all var(--transition-fast);
        }
        .toggle-clear:hover {
          background: var(--neutral-100);
          color: var(--danger);
        }
      `}</style>
    </div>
  );
}
