"use client";

interface NumericInputProps {
  id: string;
  label: string;
  description?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export default function NumericInput({
  id,
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
}: NumericInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(null);
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const isOutOfRange = value !== null && (value < min || value > max);

  return (
    <div className="numeric-group">
      <label htmlFor={id} className="numeric-label">
        {label}
      </label>
      {description && <p className="numeric-description">{description}</p>}
      <div className="numeric-input-wrap">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value ?? ""}
          onChange={handleChange}
          placeholder={`${min}–${max}`}
          className={`numeric-input ${isOutOfRange ? "numeric-error" : ""}`}
          aria-invalid={isOutOfRange}
          aria-describedby={isOutOfRange ? `${id}-error` : undefined}
        />
        {unit && <span className="numeric-unit">{unit}</span>}
      </div>
      {isOutOfRange && (
        <p id={`${id}-error`} className="numeric-error-text" role="alert">
          Value must be between {min} and {max} {unit}
        </p>
      )}

      <style jsx>{`
        .numeric-group {
          padding: var(--space-3) 0;
        }
        .numeric-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--neutral-950);
          margin-bottom: var(--space-1);
        }
        .numeric-description {
          font-size: 12px;
          color: var(--neutral-500);
          margin-bottom: var(--space-2);
        }
        .numeric-input-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .numeric-input {
          width: 140px;
          min-height: 44px;
          padding: 0 var(--space-3);
          border: 1px solid var(--neutral-300);
          border-radius: var(--button-radius);
          font-family: var(--font-mono);
          font-size: 16px;
          color: var(--neutral-950);
          background: var(--white);
          transition: border-color var(--transition-fast);
        }
        .numeric-input:focus {
          border-color: var(--primary-700);
          outline: none;
          box-shadow: 0 0 0 3px var(--primary-100);
        }
        .numeric-input::placeholder {
          color: var(--neutral-500);
          font-family: var(--font-sans);
          font-size: 13px;
        }
        .numeric-error {
          border-color: var(--danger) !important;
        }
        .numeric-error:focus {
          box-shadow: 0 0 0 3px var(--danger-bg) !important;
        }
        .numeric-unit {
          font-size: 14px;
          font-weight: 500;
          color: var(--neutral-500);
        }
        .numeric-error-text {
          font-size: 12px;
          color: var(--danger);
          margin-top: var(--space-1);
        }
        /* Hide number spinners */
        .numeric-input::-webkit-inner-spin-button,
        .numeric-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .numeric-input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
