"""
Unit tests for the FuzzyAutomaton engine.

Tests the full evaluation pipeline with hand-computed examples,
missing data, red-flag detection, and deterministic behavior.
"""

import pytest

from app.engine.fuzzy_automaton import FuzzyAutomaton


@pytest.fixture
def engine():
    """Create a FuzzyAutomaton instance with default data."""
    return FuzzyAutomaton()


class TestEngineInitialization:
    """Tests for engine loading and validation."""

    def test_engine_loads(self, engine):
        """Engine should load without errors."""
        assert engine is not None
        assert len(engine.conditions) == 10
        assert len(engine.symptoms) == 15

    def test_rule_base_version(self, engine):
        """Rule base version should be set."""
        assert engine.rule_base_version == "1.0.0"

    def test_rule_base_validates(self, engine):
        """Rule base should pass validation."""
        errors = engine.validate_rule_base()
        assert len(errors) == 0, f"Validation errors: {errors}"

    def test_condition_ids(self, engine):
        """Should have exactly 10 condition IDs."""
        assert len(engine.condition_ids) == 10
        assert "influenza" in engine.condition_ids
        assert "migraine" in engine.condition_ids


class TestDiagnosisEvaluation:
    """Tests for the full evaluation pipeline."""

    def test_flu_like_symptoms(self, engine):
        """Flu-like input should rank influenza highly."""
        result = engine.evaluate({
            "temperature_c": 38.8,
            "fatigue": 0.8,
            "body_aches": 0.7,
            "cough": 0.5,
            "headache": 0.5,
            "sore_throat": 0.4,
        })

        assert "diagnoses" in result
        assert len(result["diagnoses"]) > 0

        # Influenza should appear in top 3
        top_3_ids = [d["condition_id"] for d in result["diagnoses"][:3]]
        assert "influenza" in top_3_ids, f"Influenza not in top 3: {top_3_ids}"

    def test_gerd_symptoms(self, engine):
        """GERD-specific symptoms should rank GERD highly."""
        result = engine.evaluate({
            "heartburn": 0.9,
            "abdominal_pain": 0.5,
            "nausea": 0.3,
            "chest_pain": 0.2,
        })

        top_3_ids = [d["condition_id"] for d in result["diagnoses"][:3]]
        assert "gerd" in top_3_ids, f"GERD not in top 3: {top_3_ids}"

    def test_anxiety_symptoms(self, engine):
        """Anxiety symptoms should rank anxiety highly."""
        result = engine.evaluate({
            "anxiety_level": 0.85,
            "fatigue": 0.6,
            "chest_pain": 0.15,
            "shortness_of_breath": 0.2,
            "heart_rate_bpm": 105,
        })

        top_3_ids = [d["condition_id"] for d in result["diagnoses"][:3]]
        assert "anxiety_disorder" in top_3_ids, f"Anxiety not in top 3: {top_3_ids}"

    def test_result_structure(self, engine):
        """Result should have all required fields."""
        result = engine.evaluate({"temperature_c": 38.0, "fatigue": 0.5})

        assert "session_id" in result
        assert "diagnoses" in result
        assert "warnings" in result
        assert "missing_symptom_count" in result
        assert "data_completeness" in result
        assert "composition_method" in result
        assert "rule_base_version" in result
        assert "insufficient_evidence" in result

    def test_disclaimer_always_present(self, engine):
        """Medical disclaimer must always be in warnings."""
        result = engine.evaluate({"temperature_c": 37.0})
        disclaimer_found = any(
            "decision support" in w.lower() or "not a substitute" in w.lower()
            for w in result["warnings"]
        )
        assert disclaimer_found, "Medical disclaimer not found in warnings"

    def test_contributors_present(self, engine):
        """Each diagnosis should have contributor tracing."""
        result = engine.evaluate({
            "temperature_c": 38.8,
            "fatigue": 0.7,
            "body_aches": 0.6,
        })

        for diag in result["diagnoses"]:
            assert "contributors" in diag
            # Top diagnoses should have at least one contributor
            if diag["confidence"] > 0.1:
                assert len(diag["contributors"]) > 0, (
                    f"{diag['condition_name']} has no contributors "
                    f"despite confidence {diag['confidence']}"
                )

    def test_confidence_in_range(self, engine):
        """All confidence scores must be in [0.0, 1.0]."""
        result = engine.evaluate({
            "temperature_c": 39.0,
            "fatigue": 0.9,
            "headache": 0.8,
            "cough": 0.6,
        })

        for diag in result["diagnoses"]:
            assert 0.0 <= diag["confidence"] <= 1.0
            assert 0 <= diag["confidence_percent"] <= 100

    def test_relevance_labels(self, engine):
        """Relevance labels should match confidence ranges."""
        result = engine.evaluate({
            "temperature_c": 38.8,
            "fatigue": 0.8,
            "body_aches": 0.7,
        })

        for diag in result["diagnoses"]:
            pct = diag["confidence_percent"]
            label = diag["relevance_label"]
            if pct >= 70:
                assert label == "Higher relevance"
            elif pct >= 40:
                assert label == "Moderate relevance"
            else:
                assert label == "Lower relevance"


class TestMissingData:
    """Tests for handling missing/incomplete symptom data."""

    def test_empty_symptoms(self, engine):
        """Empty symptoms dict should not crash."""
        result = engine.evaluate({})
        assert "diagnoses" in result
        assert result["missing_symptom_count"] == 15

    def test_all_none_symptoms(self, engine):
        """All-None symptoms should not crash."""
        result = engine.evaluate({
            "temperature_c": None,
            "fatigue": None,
            "headache": None,
        })
        assert "diagnoses" in result

    def test_partial_symptoms(self, engine):
        """30-50% provided symptoms should produce results."""
        result = engine.evaluate({
            "temperature_c": 38.5,
            "fatigue": 0.7,
            "headache": 0.5,
            "cough": 0.4,
            "body_aches": 0.6,
        })
        assert len(result["diagnoses"]) > 0
        assert result["data_completeness"]["provided_count"] == 5
        assert result["data_completeness"]["missing_count"] == 10

    def test_missing_data_metadata(self, engine):
        """Data completeness metadata should be accurate."""
        result = engine.evaluate({
            "temperature_c": 38.0,
            "fatigue": 0.5,
        })
        comp = result["data_completeness"]
        assert comp["total_symptoms"] == 15
        assert comp["provided_count"] == 2
        assert comp["missing_count"] == 13
        assert len(comp["missing_symptoms"]) == 13


class TestRedFlags:
    """Tests for emergency/red-flag symptom detection."""

    def test_high_chest_pain_triggers_warning(self, engine):
        """Chest pain >= 0.8 should trigger emergency warning."""
        result = engine.evaluate({"chest_pain": 0.85})
        urgent_warnings = [w for w in result["warnings"] if "URGENT" in w]
        assert len(urgent_warnings) > 0, "No urgent warning for high chest pain"

    def test_very_high_temperature_triggers_warning(self, engine):
        """Temperature >= 40.5 should trigger emergency warning."""
        result = engine.evaluate({"temperature_c": 41.0})
        urgent_warnings = [w for w in result["warnings"] if "URGENT" in w]
        assert len(urgent_warnings) > 0, "No urgent warning for very high temp"

    def test_severe_breathlessness_triggers_warning(self, engine):
        """Shortness of breath >= 0.9 should trigger emergency warning."""
        result = engine.evaluate({"shortness_of_breath": 0.95})
        urgent_warnings = [w for w in result["warnings"] if "URGENT" in w]
        assert len(urgent_warnings) > 0, "No urgent warning for severe breathlessness"

    def test_normal_values_no_urgent_warning(self, engine):
        """Normal symptom values should not trigger urgent warnings."""
        result = engine.evaluate({
            "temperature_c": 37.0,
            "chest_pain": 0.1,
            "shortness_of_breath": 0.1,
        })
        urgent_warnings = [w for w in result["warnings"] if "URGENT" in w]
        assert len(urgent_warnings) == 0, f"False urgent warnings: {urgent_warnings}"


class TestDeterminism:
    """Tests for deterministic behavior."""

    def test_same_input_same_output(self, engine):
        """Identical inputs must produce identical outputs (except session_id)."""
        symptoms = {
            "temperature_c": 38.5,
            "fatigue": 0.7,
            "headache": 0.5,
        }

        result1 = engine.evaluate(symptoms)
        result2 = engine.evaluate(symptoms)

        # Session IDs are unique
        assert result1["session_id"] != result2["session_id"]

        # But diagnosis results should be identical
        for d1, d2 in zip(result1["diagnoses"], result2["diagnoses"]):
            assert d1["condition_id"] == d2["condition_id"]
            assert d1["confidence"] == d2["confidence"]
            assert d1["contributors"] == d2["contributors"]

    def test_composition_method_affects_output(self, engine):
        """Different composition methods should potentially produce different results."""
        symptoms = {
            "temperature_c": 38.8,
            "fatigue": 0.8,
            "body_aches": 0.7,
        }

        result_mm = engine.evaluate(symptoms, composition_method="max_min")
        result_mp = engine.evaluate(symptoms, composition_method="max_product")

        # Both should produce valid results
        assert len(result_mm["diagnoses"]) > 0
        assert len(result_mp["diagnoses"]) > 0
        assert result_mm["composition_method"] == "max_min"
        assert result_mp["composition_method"] == "max_product"
