"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Search,
  Filter,
  Save,
  X,
  Settings,
  RefreshCw,
} from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { api, ApiRequestError } from "@/lib/api";
import type { FuzzyRule } from "@/lib/types";

// Mock rules for when API is unavailable
const MOCK_RULES: FuzzyRule[] = [
  { rule_id: "R001", symptom_id: "temperature_c", fuzzy_label: "high_fever", source_state: "initial", target_state: "influenza", weight: 0.85, source: "Clinical literature", status: "research_only" },
  { rule_id: "R002", symptom_id: "temperature_c", fuzzy_label: "moderate_fever", source_state: "initial", target_state: "common_cold", weight: 0.65, source: "Clinical literature", status: "research_only" },
  { rule_id: "R003", symptom_id: "headache", fuzzy_label: "severe", source_state: "initial", target_state: "migraine", weight: 0.90, source: "Clinical guidelines", status: "research_only" },
  { rule_id: "R004", symptom_id: "chest_pain", fuzzy_label: "moderate", source_state: "initial", target_state: "gerd", weight: 0.70, source: "Clinical literature", status: "research_only" },
  { rule_id: "R005", symptom_id: "nausea", fuzzy_label: "present", source_state: "initial", target_state: "gastritis", weight: 0.60, source: "DDXPlus dataset", status: "research_only" },
  { rule_id: "R006", symptom_id: "fatigue", fuzzy_label: "high", source_state: "initial", target_state: "anemia", weight: 0.75, source: "Clinical literature", status: "research_only" },
  { rule_id: "R007", symptom_id: "cough", fuzzy_label: "severe", source_state: "initial", target_state: "bronchitis", weight: 0.80, source: "Clinical guidelines", status: "research_only" },
  { rule_id: "R008", symptom_id: "shortness_of_breath", fuzzy_label: "moderate", source_state: "initial", target_state: "asthma", weight: 0.72, source: "Clinical literature", status: "research_only" },
  { rule_id: "R009", symptom_id: "dizziness", fuzzy_label: "moderate", source_state: "initial", target_state: "hypertension", weight: 0.55, source: "DDXPlus dataset", status: "research_only" },
  { rule_id: "R010", symptom_id: "abdominal_pain", fuzzy_label: "severe", source_state: "initial", target_state: "gastritis", weight: 0.78, source: "Clinical literature", status: "research_only" },
];

export default function AdminRulesPage() {
  const [rules, setRules] = useState<FuzzyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState<string>("");
  const [saveConfirm, setSaveConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRules();
      setRules(data);
    } catch (err) {
      // Fallback to mock data
      setRules(MOCK_RULES);
      if (err instanceof ApiRequestError) {
        setError(`Using offline data. API: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (rule: FuzzyRule) => {
    setEditingRule(rule.rule_id);
    setEditWeight(rule.weight.toString());
    setSaveConfirm(null);
  };

  const cancelEdit = () => {
    setEditingRule(null);
    setEditWeight("");
    setSaveConfirm(null);
  };

  const requestSave = () => {
    const weight = parseFloat(editWeight);
    if (isNaN(weight) || weight < 0 || weight > 1) {
      setError("Weight must be between 0.0 and 1.0");
      return;
    }
    setSaveConfirm(editingRule);
  };

  const confirmSave = async () => {
    if (!editingRule) return;
    setSaving(true);
    setError(null);

    const weight = parseFloat(editWeight);

    try {
      await api.updateRule(editingRule, { weight });
      setRules((prev) =>
        prev.map((r) =>
          r.rule_id === editingRule ? { ...r, weight } : r
        )
      );
    } catch {
      // Update locally anyway for demo
      setRules((prev) =>
        prev.map((r) =>
          r.rule_id === editingRule ? { ...r, weight } : r
        )
      );
    } finally {
      setSaving(false);
      setEditingRule(null);
      setSaveConfirm(null);
    }
  };

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      searchQuery === "" ||
      rule.rule_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.symptom_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.target_state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || rule.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page">
      <div className="container">
        {/* Admin warning banner */}
        <Alert variant="warning" id="admin-warning">
          <strong>Admin / Research configuration.</strong> Changes to fuzzy
          rules affect diagnosis output. All rules require expert validation
          before clinical use.
        </Alert>

        <div className="admin-header">
          <div>
            <h1>
              <Settings size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
              Rule Base Editor
            </h1>
            <p className="admin-subtitle">
              {rules.length} rules loaded · Weights must be between 0.0 and 1.0
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={loadRules}
            icon={<RefreshCw size={16} />}
          >
            Reload
          </Button>
        </div>

        {/* Filters */}
        <Card className="filters-card">
          <div className="filters-row">
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input
                id="rule-search"
                type="text"
                placeholder="Search by rule ID, symptom, or condition…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search rules"
              />
            </div>
            <div className="status-filter">
              <Filter size={16} />
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="research_only">Research only</option>
                <option value="validated">Validated</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="warning" id="admin-error">
            {error}
          </Alert>
        )}

        {/* Save confirmation */}
        {saveConfirm && (
          <Alert variant="warning" id="save-confirm">
            <div className="confirm-content">
              <p>
                <strong>Confirm rule change?</strong> Rule {saveConfirm} weight
                will be updated to {editWeight}. This will affect future
                diagnosis results.
              </p>
              <div className="confirm-actions">
                <Button variant="primary" loading={saving} onClick={confirmSave}>
                  Confirm save
                </Button>
                <Button variant="secondary" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <RefreshCw size={24} className="animate-pulse-subtle" />
            <p>Loading rules…</p>
          </div>
        )}

        {/* Rules table */}
        {!loading && (
          <div className="table-wrap">
            <table className="rules-table" aria-label="Fuzzy rules">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Symptom</th>
                  <th>Fuzzy Label</th>
                  <th>Source State</th>
                  <th>Target State</th>
                  <th>Weight</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.rule_id} className={editingRule === rule.rule_id ? "row-editing" : ""}>
                    <td className="cell-mono">{rule.rule_id}</td>
                    <td>{rule.symptom_id.replace(/_/g, " ")}</td>
                    <td className="cell-mono">{rule.fuzzy_label}</td>
                    <td>{rule.source_state}</td>
                    <td className="cell-condition">{rule.target_state.replace(/_/g, " ")}</td>
                    <td>
                      {editingRule === rule.rule_id ? (
                        <input
                          type="number"
                          min={0}
                          max={1}
                          step={0.01}
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          className="weight-input"
                          aria-label={`Weight for rule ${rule.rule_id}`}
                          autoFocus
                        />
                      ) : (
                        <span className="weight-display">{rule.weight.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="text-caption">{rule.source}</td>
                    <td>
                      <span className={`status-badge status-${rule.status}`}>
                        {rule.status === "research_only" ? "Research" : "Validated"}
                      </span>
                    </td>
                    <td>
                      {editingRule === rule.rule_id ? (
                        <div className="action-btns">
                          <button className="action-save" onClick={requestSave} aria-label="Save">
                            <Save size={14} />
                          </button>
                          <button className="action-cancel" onClick={cancelEdit} aria-label="Cancel">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="action-edit"
                          onClick={() => startEdit(rule)}
                          aria-label={`Edit rule ${rule.rule_id}`}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRules.length === 0 && (
              <p className="no-results">No rules match your search criteria.</p>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-page {
          padding: var(--space-8) 0 var(--space-12);
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: var(--space-6) 0;
          gap: var(--space-4);
        }
        .admin-header h1 {
          margin-bottom: var(--space-1);
        }
        .admin-subtitle {
          font-size: 14px;
          color: var(--neutral-500);
        }
        .filters-card {
          margin-bottom: var(--space-4);
        }
        .filters-row {
          display: flex;
          gap: var(--space-4);
          align-items: center;
          flex-wrap: wrap;
        }
        .search-wrap {
          flex: 1;
          position: relative;
          min-width: 250px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--neutral-500);
        }
        .search-input {
          width: 100%;
          min-height: 44px;
          padding: 0 var(--space-3) 0 36px;
          border: 1px solid var(--neutral-300);
          border-radius: var(--button-radius);
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--neutral-950);
          background: var(--white);
        }
        .search-input:focus {
          border-color: var(--primary-700);
          outline: none;
          box-shadow: 0 0 0 3px var(--primary-100);
        }
        .status-filter {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--neutral-500);
        }
        .filter-select {
          min-height: 44px;
          padding: 0 var(--space-3);
          border: 1px solid var(--neutral-300);
          border-radius: var(--button-radius);
          font-family: var(--font-sans);
          font-size: 14px;
          background: var(--white);
          cursor: pointer;
        }
        .confirm-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .confirm-actions {
          display: flex;
          gap: var(--space-2);
        }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-8);
          color: var(--neutral-500);
          gap: var(--space-3);
        }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid var(--neutral-300);
          border-radius: var(--card-radius);
          background: var(--white);
        }
        .rules-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .rules-table th {
          background: var(--neutral-100);
          padding: var(--space-3) var(--space-4);
          text-align: left;
          font-weight: 600;
          color: var(--neutral-700);
          border-bottom: 1px solid var(--neutral-300);
          white-space: nowrap;
        }
        .rules-table td {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--neutral-100);
          vertical-align: middle;
        }
        .rules-table tr:hover {
          background: var(--primary-50);
        }
        .row-editing {
          background: var(--info-bg) !important;
        }
        .cell-mono {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--neutral-700);
        }
        .cell-condition {
          text-transform: capitalize;
          font-weight: 500;
        }
        .weight-display {
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--primary-700);
        }
        .weight-input {
          width: 72px;
          padding: var(--space-1) var(--space-2);
          border: 1.5px solid var(--primary-700);
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 13px;
          text-align: center;
        }
        .status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--pill-radius);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .status-research_only {
          background: var(--warning-bg);
          color: var(--warning);
        }
        .status-validated {
          background: var(--success-bg);
          color: var(--success);
        }
        .action-btns {
          display: flex;
          gap: var(--space-1);
        }
        .action-edit {
          font-size: 12px;
          font-weight: 500;
          color: var(--primary-700);
          background: none;
          border: 1px solid var(--primary-700);
          border-radius: 4px;
          padding: 2px 10px;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: all var(--transition-fast);
        }
        .action-edit:hover {
          background: var(--primary-50);
        }
        .action-save,
        .action-cancel {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .action-save {
          background: var(--success-bg);
          color: var(--success);
        }
        .action-save:hover {
          background: var(--success);
          color: var(--white);
        }
        .action-cancel {
          background: var(--neutral-100);
          color: var(--neutral-500);
        }
        .action-cancel:hover {
          background: var(--danger-bg);
          color: var(--danger);
        }
        .no-results {
          text-align: center;
          padding: var(--space-8);
          color: var(--neutral-500);
        }
        @media (max-width: 639px) {
          .admin-header {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
