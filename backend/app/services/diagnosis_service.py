"""
Diagnosis service — orchestrates the FFA engine for API consumption.

Keeps business logic out of API route handlers per Rules.md code quality rules.
"""

from __future__ import annotations

from typing import Any

from ..engine.fuzzy_automaton import FuzzyAutomaton


class DiagnosisService:
    """Service layer wrapping the FuzzyAutomaton engine.

    Parameters
    ----------
    engine : FuzzyAutomaton
        The configured FFA engine instance.
    """

    def __init__(self, engine: FuzzyAutomaton) -> None:
        self._engine = engine

    def evaluate(
        self,
        symptoms: dict[str, float | None],
        demographics: dict[str, Any] | None = None,
        composition_method: str = "max_min",
    ) -> dict[str, Any]:
        """Run diagnosis evaluation.

        Parameters
        ----------
        symptoms : dict
            Symptom values from the API request.
        demographics : dict, optional
            Optional demographics.
        composition_method : str
            Composition method to use.

        Returns
        -------
        dict
            Complete diagnosis result.
        """
        return self._engine.evaluate(
            symptom_values=symptoms,
            demographics=demographics,
            composition_method=composition_method,
        )

    def get_conditions(self) -> list[dict]:
        """Return all supported conditions."""
        return self._engine.conditions

    def get_symptoms(self) -> list[dict]:
        """Return all supported symptoms."""
        return self._engine.symptoms

    def get_health_info(self) -> dict[str, Any]:
        """Return engine health/status information."""
        return {
            "rule_base_version": self._engine.rule_base_version,
            "conditions_count": len(self._engine.conditions),
            "symptoms_count": len(self._engine.symptoms),
        }
