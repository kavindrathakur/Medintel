"use client";

interface SliderInputProps {
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

export default function SliderInput({
  id,
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
  unit,
}: SliderInputProps) {
  const displayValue = value !== null ? value.toFixed(1) : "—";
  const isActive = value !== null;

  return (
    <div className="slider-group">
      <div className="slider-header">
        <label htmlFor={id} className="slider-label">
          {label}
        </label>
        <span className={`slider-value ${isActive ? "slider-value-active" : ""}`}>
          {displayValue}
          {unit && isActive && <span className="slider-unit">{unit}</span>}
        </span>
      </div>
      {description && <p className="slider-description">{description}</p>}
      <div className="slider-track-wrap">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value ?? min}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-input"
          aria-label={label}
        />
        <div className="slider-labels">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      {!isActive && (
        <button
          type="button"
          className="slider-activate"
          onClick={() => onChange(min)}
        >
          Set value
        </button>
      )}

      <style jsx>{`
        .slider-group {
          padding: var(--space-3) 0;
        }
        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--space-1);
        }
        .slider-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--neutral-950);
        }
        .slider-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--neutral-500);
          font-variant-numeric: tabular-nums;
          font-family: var(--font-mono);
        }
        .slider-value-active {
          color: var(--primary-700);
        }
        .slider-unit {
          font-size: 12px;
          font-weight: 400;
          margin-left: 2px;
          opacity: 0.7;
        }
        .slider-description {
          font-size: 12px;
          color: var(--neutral-500);
          margin-bottom: var(--space-2);
        }
        .slider-track-wrap {
          position: relative;
        }
        .slider-input {
          width: 100%;
          height: 6px;
          border-radius: var(--pill-radius);
          background: var(--neutral-100);
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
        }
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary-700);
          cursor: pointer;
          border: 3px solid var(--white);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
          transition: transform var(--transition-fast);
        }
        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .slider-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary-700);
          cursor: pointer;
          border: 3px solid var(--white);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
        }
        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--neutral-500);
          margin-top: var(--space-1);
        }
        .slider-activate {
          margin-top: var(--space-2);
          font-size: 12px;
          color: var(--primary-700);
          background: none;
          border: 1px dashed var(--primary-700);
          border-radius: var(--button-radius);
          padding: var(--space-1) var(--space-3);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .slider-activate:hover {
          background: var(--primary-50);
        }
      `}</style>
    </div>
  );
}
