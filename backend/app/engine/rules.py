"""
Fuzzy rule evaluation for the MedFA engine.

Loads rules from JSON configuration and builds symptom-specific
transition matrices for the FFA.
"""

from __future__ import annotations

from typing import Any

import numpy as np


class RuleBase:
    """Manages the fuzzy rule base and builds transition matrices.

    Parameters
    ----------
    rules : list of dict
        List of rule definitions loaded from default_rules.json.
    condition_ids : list of str
        Ordered list of condition/state IDs.
    version : str
        Rule-base version identifier.
    """

    def __init__(
        self,
        rules: list[dict[str, Any]],
        condition_ids: list[str],
        version: str = "1.0.0",
    ) -> None:
        self.rules = rules
        self.condition_ids = condition_ids
        self.condition_index = {cid: i for i, cid in enumerate(condition_ids)}
        self.n_states = len(condition_ids)
        self.version = version

        # Index rules by symptom_id and fuzzy_label for fast lookup
        self._rule_index: dict[str, dict[str, list[dict]]] = {}
        for rule in rules:
            symptom_id = rule["symptom_id"]
            fuzzy_label = rule["fuzzy_label"]
            if symptom_id not in self._rule_index:
                self._rule_index[symptom_id] = {}
            if fuzzy_label not in self._rule_index[symptom_id]:
                self._rule_index[symptom_id][fuzzy_label] = []
            self._rule_index[symptom_id][fuzzy_label].append(rule)

    def build_transition_matrix(
        self,
        symptom_id: str,
        fuzzified_values: dict[str, float | None],
    ) -> tuple[np.ndarray, list[dict]]:
        """Build a composite transition matrix for one symptom.

        The matrix combines all fuzzy-label-specific rules for this symptom,
        weighted by the fuzzified membership degree of each label.

        Parameters
        ----------
        symptom_id : str
            The symptom being processed.
        fuzzified_values : dict
            Mapping of fuzzy_label -> membership degree for this symptom.

        Returns
        -------
        tuple of (np.ndarray, list of dict)
            The composite transition matrix (n_states x n_states) and
            a list of activated rule records for explainability.
        """
        matrix = np.zeros((self.n_states, self.n_states), dtype=np.float64)
        activated_rules: list[dict] = []

        symptom_rules = self._rule_index.get(symptom_id, {})

        for fuzzy_label, membership in fuzzified_values.items():
            # Skip unknown (None) memberships — missing data
            if membership is None or membership == 0.0:
                continue

            label_rules = symptom_rules.get(fuzzy_label, [])
            for rule in label_rules:
                source_id = rule["source_state"]
                target_id = rule["target_state"]
                weight = rule["weight"]

                source_idx = self.condition_index.get(source_id)
                target_idx = self.condition_index.get(target_id)

                if source_idx is None or target_idx is None:
                    continue

                # Effective transition strength = membership × rule weight
                effective = membership * weight
                # Take max if multiple rules affect the same cell
                matrix[source_idx, target_idx] = max(
                    matrix[source_idx, target_idx], effective
                )

                activated_rules.append({
                    "rule_id": rule.get("rule_id", "unknown"),
                    "symptom_id": symptom_id,
                    "fuzzy_label": fuzzy_label,
                    "membership": membership,
                    "source_state": source_id,
                    "target_state": target_id,
                    "weight": weight,
                    "effective_strength": effective,
                })

        return matrix, activated_rules

    def get_rules_for_symptom(self, symptom_id: str) -> list[dict]:
        """Return all rules associated with a symptom."""
        result = []
        for label_rules in self._rule_index.get(symptom_id, {}).values():
            result.extend(label_rules)
        return result

    def get_rule_by_id(self, rule_id: str) -> dict | None:
        """Find a rule by its ID."""
        for rule in self.rules:
            if rule.get("rule_id") == rule_id:
                return rule
        return None

    def validate(self) -> list[str]:
        """Validate the rule base for common issues.

        Returns
        -------
        list of str
            List of validation error messages (empty if valid).
        """
        errors: list[str] = []

        for i, rule in enumerate(self.rules):
            rule_id = rule.get("rule_id", f"index_{i}")

            # Check weight range
            weight = rule.get("weight", -1)
            if not (0.0 <= weight <= 1.0):
                errors.append(f"Rule {rule_id}: weight {weight} not in [0.0, 1.0]")

            # Check state references
            source = rule.get("source_state")
            target = rule.get("target_state")
            if source not in self.condition_index:
                errors.append(f"Rule {rule_id}: unknown source_state '{source}'")
            if target not in self.condition_index:
                errors.append(f"Rule {rule_id}: unknown target_state '{target}'")

            # Check required fields
            for field in ["symptom_id", "fuzzy_label", "source_state", "target_state", "weight"]:
                if field not in rule:
                    errors.append(f"Rule {rule_id}: missing required field '{field}'")

        # Check for duplicate rule IDs
        ids = [r.get("rule_id") for r in self.rules if "rule_id" in r]
        seen = set()
        for rid in ids:
            if rid in seen:
                errors.append(f"Duplicate rule_id: {rid}")
            seen.add(rid)

        return errors
