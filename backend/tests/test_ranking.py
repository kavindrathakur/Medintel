"""
Unit tests for ranking and normalization.
"""

import numpy as np
import pytest

from app.engine.ranking import (
    normalize_scores,
    rank_diagnoses,
    check_insufficient_evidence,
    _relevance_label,
)


class TestNormalizeScores:
    """Tests for score normalization."""

    def test_basic_normalization(self):
        """Max score should become 1.0."""
        scores = np.array([0.4, 0.8, 0.2])
        result = normalize_scores(scores)
        assert result[1] == 1.0
        assert abs(result[0] - 0.5) < 1e-10
        assert abs(result[2] - 0.25) < 1e-10

    def test_all_zeros(self):
        """All-zero vector should remain zeros."""
        scores = np.array([0.0, 0.0, 0.0])
        result = normalize_scores(scores)
        assert np.all(result == 0.0)

    def test_already_normalized(self):
        """A vector with max=1.0 should be unchanged."""
        scores = np.array([0.5, 1.0, 0.3])
        result = normalize_scores(scores)
        np.testing.assert_array_almost_equal(result, scores)

    def test_single_value(self):
        """Single non-zero value should become 1.0."""
        scores = np.array([0.0, 0.0, 0.3, 0.0])
        result = normalize_scores(scores)
        assert result[2] == 1.0


class TestRankDiagnoses:
    """Tests for diagnosis ranking."""

    def test_ranking_order(self):
        """Diagnoses should be ranked highest confidence first."""
        scores = np.array([0.3, 0.8, 0.5])
        ids = ["a", "b", "c"]
        meta = {
            "a": {"name": "A", "description": "", "category": ""},
            "b": {"name": "B", "description": "", "category": ""},
            "c": {"name": "C", "description": "", "category": ""},
        }
        result = rank_diagnoses(scores, ids, meta)
        assert result[0]["condition_id"] == "b"
        assert result[1]["condition_id"] == "c"
        assert result[2]["condition_id"] == "a"

    def test_threshold_filtering(self):
        """Scores below threshold should be excluded."""
        scores = np.array([0.005, 0.8, 0.0])
        ids = ["a", "b", "c"]
        meta = {
            "a": {"name": "A", "description": "", "category": ""},
            "b": {"name": "B", "description": "", "category": ""},
            "c": {"name": "C", "description": "", "category": ""},
        }
        result = rank_diagnoses(scores, ids, meta, min_score_threshold=0.01)
        ids_in_result = [d["condition_id"] for d in result]
        assert "b" in ids_in_result
        assert "c" not in ids_in_result

    def test_ranks_assigned(self):
        """Each diagnosis should have a sequential rank."""
        scores = np.array([0.5, 0.3, 0.8])
        ids = ["a", "b", "c"]
        meta = {k: {"name": k, "description": "", "category": ""} for k in ids}
        result = rank_diagnoses(scores, ids, meta)
        ranks = [d["rank"] for d in result]
        assert ranks == [1, 2, 3]


class TestRelevanceLabel:
    """Tests for relevance label assignment."""

    def test_higher_relevance(self):
        assert _relevance_label(70) == "Higher relevance"
        assert _relevance_label(100) == "Higher relevance"
        assert _relevance_label(85) == "Higher relevance"

    def test_moderate_relevance(self):
        assert _relevance_label(40) == "Moderate relevance"
        assert _relevance_label(69) == "Moderate relevance"
        assert _relevance_label(55) == "Moderate relevance"

    def test_lower_relevance(self):
        assert _relevance_label(0) == "Lower relevance"
        assert _relevance_label(39) == "Lower relevance"
        assert _relevance_label(20) == "Lower relevance"


class TestInsufficientEvidence:
    """Tests for insufficient evidence detection."""

    def test_all_low_scores(self):
        """All scores below threshold should indicate insufficient evidence."""
        scores = np.array([0.01, 0.02, 0.03])
        assert check_insufficient_evidence(scores, threshold=0.05) is True

    def test_has_evidence(self):
        """At least one score above threshold means sufficient evidence."""
        scores = np.array([0.01, 0.5, 0.03])
        assert check_insufficient_evidence(scores, threshold=0.05) is False

    def test_all_zeros(self):
        """All zeros should indicate insufficient evidence."""
        scores = np.array([0.0, 0.0, 0.0])
        assert check_insufficient_evidence(scores) is True
