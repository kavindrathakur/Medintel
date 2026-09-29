"""
Explainability and attribution tracing for MedFA diagnoses.

Traces which symptoms drove which diagnoses and by how much,
producing human-readable contribution breakdowns.
"""

from __future__ import annotations

from typing import Any


def compute_contributions(
    activated_rules: list[dict],
    condition_ids: list[str],
) -> dict[str, list[dict]]:
    """Compute per-condition symptom contributions from activated rules.

    Groups all activated rules by target condition and aggregates
    contribution from each symptom.

    Parameters
    ----------
    activated_rules : list of dict
        All rules activated during evaluation, each containing:
        symptom_id, target_state, effective_strength, etc.
    condition_ids : list of str
        All condition IDs in the system.

    Returns
    -------
    dict
        Mapping of condition_id -> list of contributor dicts, sorted
        by contribution descending.
    """
    # Aggregate contributions: condition -> symptom -> max effective strength
    contrib_map: dict[str, dict[str, float]] = {cid: {} for cid in condition_ids}

    for rule in activated_rules:
        target = rule["target_state"]
        symptom = rule["symptom_id"]
        strength = rule["effective_strength"]

        if target not in contrib_map:
            continue

        # Take max contribution per symptom per condition
        current = contrib_map[target].get(symptom, 0.0)
        contrib_map[target][symptom] = max(current, strength)

    # Convert to sorted contributor lists
    result: dict[str, list[dict]] = {}
    for cid in condition_ids:
        contributors = []
        for symptom_id, value in contrib_map[cid].items():
            if value > 0.0:
                contributors.append({
                    "symptom": symptom_id,
                    "contribution": round(value, 4),
                })
        # Sort by contribution descending
        contributors.sort(key=lambda c: -c["contribution"])
        result[cid] = contributors

    return result


def build_explanation_trace(
    activated_rules: list[dict],
    condition_id: str,
) -> list[dict]:
    """Build a detailed rule-level trace for a specific condition.

    Used for advanced debugging / admin views, not shown to end users.

    Parameters
    ----------
    activated_rules : list of dict
        All activated rules from evaluation.
    condition_id : str
        The condition to trace.

    Returns
    -------
    list of dict
        Filtered and sorted list of rule activations for this condition.
    """
    relevant = [
        r for r in activated_rules
        if r["target_state"] == condition_id
    ]
    relevant.sort(key=lambda r: -r["effective_strength"])
    return relevant


def compute_missing_data_metadata(
    symptom_values: dict[str, float | None],
    all_symptom_ids: list[str],
) -> dict[str, Any]:
    """Compute metadata about missing/provided symptom data.

    Parameters
    ----------
    symptom_values : dict
        User-provided symptom values (None for missing).
    all_symptom_ids : list of str
        All symptom IDs the system supports.

    Returns
    -------
    dict
        Metadata including counts and completeness ratio.
    """
    total = len(all_symptom_ids)
    provided = sum(
        1 for sid in all_symptom_ids
        if symptom_values.get(sid) is not None
    )
    missing = total - provided
    completeness = round(provided / total, 2) if total > 0 else 0.0

    return {
        "total_symptoms": total,
        "provided_count": provided,
        "missing_count": missing,
        "completeness_ratio": completeness,
        "missing_symptoms": [
            sid for sid in all_symptom_ids
            if symptom_values.get(sid) is None
        ],
    }
