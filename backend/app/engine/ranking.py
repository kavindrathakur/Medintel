"""
Ranking and normalization for FFA diagnosis output.

Converts raw fuzzy state vectors into ranked differential diagnoses
with confidence scores and metadata.
"""

from __future__ import annotations

import numpy as np


def normalize_scores(state_vector: np.ndarray) -> np.ndarray:
    """Normalize the state vector so values are in [0, 1].

    Uses max-normalization: each score is divided by the maximum score.
    If all scores are zero, returns zeros.

    Parameters
    ----------
    state_vector : np.ndarray
        Raw fuzzy state vector.

    Returns
    -------
    np.ndarray
        Normalized scores in [0.0, 1.0].
    """
    max_val = np.max(state_vector)
    if max_val == 0.0:
        return np.zeros_like(state_vector)
    return state_vector / max_val


def rank_diagnoses(
    state_vector: np.ndarray,
    condition_ids: list[str],
    condition_metadata: dict[str, dict],
    min_score_threshold: float = 0.01,
) -> list[dict]:
    """Produce a ranked list of diagnoses from the final state vector.

    Parameters
    ----------
    state_vector : np.ndarray
        Final fuzzy state vector after all transitions.
    condition_ids : list of str
        Ordered list of condition IDs matching the state vector.
    condition_metadata : dict
        Mapping of condition_id -> {name, description, category}.
    min_score_threshold : float
        Conditions below this threshold are excluded from results.

    Returns
    -------
    list of dict
        Ranked diagnoses, highest confidence first.
    """
    normalized = normalize_scores(state_vector)

    diagnoses = []
    for i, cid in enumerate(condition_ids):
        score = float(normalized[i])
        if score < min_score_threshold:
            continue

        meta = condition_metadata.get(cid, {})
        confidence_percent = round(score * 100)

        diagnoses.append({
            "condition_id": cid,
            "condition_name": meta.get("name", cid),
            "description": meta.get("description", ""),
            "category": meta.get("category", ""),
            "confidence": round(score, 4),
            "confidence_percent": confidence_percent,
            "relevance_label": _relevance_label(confidence_percent),
        })

    # Sort by confidence descending, then by name for stability
    diagnoses.sort(key=lambda d: (-d["confidence"], d["condition_name"]))

    # Assign ranks
    for rank, diag in enumerate(diagnoses, start=1):
        diag["rank"] = rank

    return diagnoses


def _relevance_label(confidence_percent: int) -> str:
    """Return a human-readable relevance label for a confidence score.

    Per Design.md:
    - 70-100% → Higher relevance
    - 40-69%  → Moderate relevance
    - 0-39%   → Lower relevance
    """
    if confidence_percent >= 70:
        return "Higher relevance"
    elif confidence_percent >= 40:
        return "Moderate relevance"
    else:
        return "Lower relevance"


def check_insufficient_evidence(
    state_vector: np.ndarray,
    threshold: float = 0.05,
) -> bool:
    """Check if the engine has insufficient evidence for any diagnosis.

    Parameters
    ----------
    state_vector : np.ndarray
        Final state vector after transitions.
    threshold : float
        If all scores are below this, evidence is insufficient.

    Returns
    -------
    bool
        True if evidence is insufficient.
    """
    return bool(np.max(state_vector) < threshold)
