"""
Core Fuzzy Finite Automaton (FFA) class for medical diagnosis.

This is the central engine class that orchestrates the complete
diagnosis pipeline: fuzzification → state initialization → transition
→ ranking → explainability. It is framework-independent and can be
called from tests, notebooks, or FastAPI without modification.
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

import numpy as np

from .membership import fuzzify_all_symptoms
from .transitions import apply_composition
from .rules import RuleBase
from .ranking import rank_diagnoses, check_insufficient_evidence
from .explainability import (
    compute_contributions,
    compute_missing_data_metadata,
)


# Default data directory
_DATA_DIR = Path(__file__).resolve().parent.parent / "data"


class FuzzyAutomaton:
    """Medical diagnosis engine using Fuzzy Finite Automata.

    Implements the formal FFA 5-tuple (Q, Σ, δ, q₀, F):
    - Q: Diagnostic condition states
    - Σ: Symptom alphabet with fuzzy membership functions
    - δ: Fuzzy transition relation R[i][j] → [0,1]
    - q₀: Initial fuzzy distribution over states
    - F: Final state membership scores (the diagnosis output)

    Parameters
    ----------
    data_dir : Path or str, optional
        Directory containing fuzzy_sets.json and default_rules.json.
        Defaults to the bundled data directory.
    """

    def __init__(self, data_dir: Path | str | None = None) -> None:
        self._data_dir = Path(data_dir) if data_dir else _DATA_DIR
        self._fuzzy_sets_config: dict[str, list[dict]] = {}
        self._conditions: list[dict] = []
        self._symptoms: list[dict] = []
        self._rule_base: RuleBase | None = None
        self._red_flag_rules: list[dict] = []

        self._load_data()

    def _load_data(self) -> None:
        """Load fuzzy sets and rules from JSON configuration files."""
        # Load fuzzy sets
        fuzzy_sets_path = self._data_dir / "fuzzy_sets.json"
        with open(fuzzy_sets_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self._conditions = data["conditions"]
        self._symptoms = data["symptoms"]
        self._fuzzy_sets_config = {
            s["symptom_id"]: s["fuzzy_sets"]
            for s in data["symptom_definitions"]
        }
        self._red_flag_rules = data.get("red_flag_rules", [])

        # Build condition metadata lookup
        self._condition_metadata = {
            c["condition_id"]: {
                "name": c["name"],
                "description": c["description"],
                "category": c["category"],
            }
            for c in self._conditions
        }
        self._condition_ids = [c["condition_id"] for c in self._conditions]
        self._symptom_ids = [s["symptom_id"] for s in self._symptoms]

        # Load rules
        rules_path = self._data_dir / "default_rules.json"
        with open(rules_path, "r", encoding="utf-8") as f:
            rules_data = json.load(f)

        self._rule_base = RuleBase(
            rules=rules_data["rules"],
            condition_ids=self._condition_ids,
            version=rules_data.get("version", "1.0.0"),
        )

    @property
    def condition_ids(self) -> list[str]:
        """Return ordered list of condition IDs."""
        return self._condition_ids

    @property
    def conditions(self) -> list[dict]:
        """Return condition metadata list."""
        return self._conditions

    @property
    def symptoms(self) -> list[dict]:
        """Return symptom metadata list."""
        return self._symptoms

    @property
    def rule_base_version(self) -> str:
        """Return the current rule-base version."""
        return self._rule_base.version if self._rule_base else "unknown"

    def evaluate(
        self,
        symptom_values: dict[str, float | None],
        demographics: dict[str, Any] | None = None,
        composition_method: str = "max_min",
    ) -> dict[str, Any]:
        """Run the full FFA evaluation pipeline.

        Parameters
        ----------
        symptom_values : dict
            Mapping of symptom_id -> raw value. Use None for unknown symptoms.
        demographics : dict, optional
            Optional demographics (age, sex, risk_factors). Not used in
            MVP transition logic but recorded in session.
        composition_method : str
            Either 'max_min' (default) or 'max_product'.

        Returns
        -------
        dict
            Complete diagnosis result with ranked conditions, contributions,
            warnings, and metadata.
        """
        session_id = str(uuid.uuid4())
        n_states = len(self._condition_ids)

        # Step 1: Fuzzification
        fuzzified = fuzzify_all_symptoms(
            symptom_values, self._fuzzy_sets_config
        )

        # Step 2: Initialize state vector (uniform distribution)
        state_vector = np.full(n_states, 1.0 / n_states, dtype=np.float64)

        # Step 3: Process each symptom through rule evaluation + transition
        all_activated_rules: list[dict] = []

        for symptom_id in self._symptom_ids:
            if symptom_id not in fuzzified:
                continue

            symptom_fuzz = fuzzified[symptom_id]

            # Check if all memberships are None (missing symptom)
            if all(v is None for v in symptom_fuzz.values()):
                continue

            # Build transition matrix for this symptom
            transition_matrix, activated = self._rule_base.build_transition_matrix(
                symptom_id, symptom_fuzz
            )
            all_activated_rules.extend(activated)

            # Apply composition if any transitions were activated
            if np.any(transition_matrix > 0):
                state_vector = apply_composition(
                    composition_method, state_vector, transition_matrix
                )

        # Step 4: Ranking
        diagnoses = rank_diagnoses(
            state_vector,
            self._condition_ids,
            self._condition_metadata,
        )

        # Step 5: Explainability — compute contributions
        contributions = compute_contributions(
            all_activated_rules, self._condition_ids
        )

        # Attach contributors to each diagnosis
        for diag in diagnoses:
            cid = diag["condition_id"]
            diag["contributors"] = contributions.get(cid, [])

        # Step 6: Missing data metadata
        missing_meta = compute_missing_data_metadata(
            symptom_values, self._symptom_ids
        )

        # Step 7: Warnings and red flags
        warnings = self._check_red_flags(symptom_values)
        warnings.append(
            "This tool is for decision support/research only and is not a "
            "substitute for professional medical advice, diagnosis, or treatment."
        )

        # Step 8: Check insufficient evidence
        insufficient = check_insufficient_evidence(state_vector)

        return {
            "session_id": session_id,
            "diagnoses": diagnoses,
            "warnings": warnings,
            "missing_symptom_count": missing_meta["missing_count"],
            "data_completeness": missing_meta,
            "composition_method": composition_method,
            "rule_base_version": self._rule_base.version,
            "insufficient_evidence": insufficient,
            "fuzzified_inputs": {
                sid: {
                    label: round(val, 4) if val is not None else None
                    for label, val in vals.items()
                }
                for sid, vals in fuzzified.items()
            },
        }

    def _check_red_flags(
        self, symptom_values: dict[str, float | None]
    ) -> list[str]:
        """Check for emergency/red-flag symptoms.

        Returns warning messages for any triggered red flags.
        """
        warnings: list[str] = []

        for rule in self._red_flag_rules:
            symptom_id = rule["symptom_id"]
            threshold = rule["threshold"]
            operator = rule.get("operator", ">=")
            message = rule["message"]

            value = symptom_values.get(symptom_id)
            if value is None:
                continue

            triggered = False
            if operator == ">=" and value >= threshold:
                triggered = True
            elif operator == ">" and value > threshold:
                triggered = True
            elif operator == "<=" and value <= threshold:
                triggered = True
            elif operator == "<" and value < threshold:
                triggered = True

            if triggered:
                warnings.append(message)

        return warnings

    def validate_rule_base(self) -> list[str]:
        """Validate the loaded rule base for errors."""
        if self._rule_base is None:
            return ["Rule base not loaded"]
        return self._rule_base.validate()
