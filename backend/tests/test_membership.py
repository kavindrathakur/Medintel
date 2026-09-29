"""
Unit tests for fuzzy membership functions.

Tests triangular and trapezoidal functions at minimum, peak, maximum,
intermediate, and out-of-range values as required by Rules.md.
"""

import pytest

from app.engine.membership import triangular, trapezoidal, fuzzify_symptom


class TestTriangular:
    """Tests for triangular membership function."""

    def test_at_peak(self):
        """Membership should be 1.0 at the peak."""
        assert triangular(38.5, 37.5, 38.5, 39.5) == 1.0

    def test_at_left_foot(self):
        """Membership should be 0.0 at left foot."""
        assert triangular(37.5, 37.5, 38.5, 39.5) == 0.0

    def test_at_right_foot(self):
        """Membership should be 0.0 at right foot."""
        assert triangular(39.5, 37.5, 38.5, 39.5) == 0.0

    def test_below_left_foot(self):
        """Membership should be 0.0 below the left foot."""
        assert triangular(36.0, 37.5, 38.5, 39.5) == 0.0

    def test_above_right_foot(self):
        """Membership should be 0.0 above the right foot."""
        assert triangular(40.0, 37.5, 38.5, 39.5) == 0.0

    def test_left_slope_midpoint(self):
        """Halfway up the left slope should be 0.5."""
        result = triangular(38.0, 37.5, 38.5, 39.5)
        assert abs(result - 0.5) < 1e-10

    def test_right_slope_midpoint(self):
        """Halfway down the right slope should be 0.5."""
        result = triangular(39.0, 37.5, 38.5, 39.5)
        assert abs(result - 0.5) < 1e-10

    def test_result_in_range(self):
        """All results must be in [0.0, 1.0]."""
        for x in [35.0, 37.0, 37.5, 38.0, 38.5, 39.0, 39.5, 40.0, 42.0]:
            result = triangular(x, 37.5, 38.5, 39.5)
            assert 0.0 <= result <= 1.0, f"Out of range at x={x}: {result}"

    def test_invalid_parameters(self):
        """Should raise ValueError for invalid parameter order."""
        with pytest.raises(ValueError):
            triangular(38.0, 39.0, 38.0, 37.0)

    def test_degenerate_point(self):
        """When a == b == c, only the exact point has membership 1.0."""
        assert triangular(5.0, 5.0, 5.0, 5.0) == 1.0
        assert triangular(4.9, 5.0, 5.0, 5.0) == 0.0
        assert triangular(5.1, 5.0, 5.0, 5.0) == 0.0


class TestTrapezoidal:
    """Tests for trapezoidal membership function."""

    def test_at_plateau(self):
        """Membership should be 1.0 within the plateau."""
        assert trapezoidal(37.0, 35.0, 36.0, 37.2, 37.5) == 1.0

    def test_at_left_foot(self):
        """Membership should be 0.0 at left foot."""
        assert trapezoidal(35.0, 35.0, 36.0, 37.2, 37.5) == 0.0

    def test_at_right_foot(self):
        """Membership should be 0.0 at right foot."""
        assert trapezoidal(37.5, 35.0, 36.0, 37.2, 37.5) == 0.0

    def test_left_slope_midpoint(self):
        """Halfway up the left slope should be 0.5."""
        result = trapezoidal(35.5, 35.0, 36.0, 37.2, 37.5)
        assert abs(result - 0.5) < 1e-10

    def test_below_left_foot(self):
        """Below left foot should be 0.0."""
        assert trapezoidal(34.0, 35.0, 36.0, 37.2, 37.5) == 0.0

    def test_above_right_foot(self):
        """Above right foot should be 0.0."""
        assert trapezoidal(38.0, 35.0, 36.0, 37.2, 37.5) == 0.0

    def test_result_in_range(self):
        """All results must be in [0.0, 1.0]."""
        for x in [34.0, 35.0, 35.5, 36.0, 36.5, 37.0, 37.2, 37.35, 37.5, 38.0]:
            result = trapezoidal(x, 35.0, 36.0, 37.2, 37.5)
            assert 0.0 <= result <= 1.0, f"Out of range at x={x}: {result}"

    def test_invalid_parameters(self):
        """Should raise ValueError for invalid parameter order."""
        with pytest.raises(ValueError):
            trapezoidal(5.0, 1.0, 3.0, 2.0, 4.0)

    def test_open_left(self):
        """Trapezoidal with a==b creates an open-left function."""
        # Parameters: a=0, b=0, c=0.2, d=0.4
        assert trapezoidal(0.0, 0.0, 0.0, 0.2, 0.4) == 1.0
        assert trapezoidal(0.1, 0.0, 0.0, 0.2, 0.4) == 1.0
        assert trapezoidal(0.3, 0.0, 0.0, 0.2, 0.4) == 0.5

    def test_open_right(self):
        """Trapezoidal with c==d creates an open-right function."""
        # Parameters: a=0.6, b=0.8, c=1.0, d=1.0
        assert trapezoidal(1.0, 0.6, 0.8, 1.0, 1.0) == 1.0
        assert trapezoidal(0.9, 0.6, 0.8, 1.0, 1.0) == 1.0
        assert trapezoidal(0.7, 0.6, 0.8, 1.0, 1.0) == 0.5


class TestFuzzifySymptom:
    """Tests for single-symptom fuzzification."""

    def test_fuzzify_with_value(self):
        """Fuzzification should produce membership degrees for all labels."""
        sets = [
            {"label": "low", "function": "triangular", "parameters": [0.0, 0.0, 0.5]},
            {"label": "high", "function": "triangular", "parameters": [0.5, 1.0, 1.0]},
        ]
        result = fuzzify_symptom(0.25, sets)
        assert "low" in result
        assert "high" in result
        assert result["low"] == 0.5  # (0.5 - 0.25) / (0.5 - 0.0)
        assert result["high"] == 0.0  # below left foot

    def test_fuzzify_with_none(self):
        """None input should produce None memberships (unknown, not absent)."""
        sets = [
            {"label": "low", "function": "triangular", "parameters": [0.0, 0.0, 0.5]},
        ]
        result = fuzzify_symptom(None, sets)
        assert result["low"] is None

    def test_unsupported_function(self):
        """Should raise ValueError for unsupported function type."""
        sets = [{"label": "x", "function": "gaussian", "parameters": [0, 1]}]
        with pytest.raises(ValueError, match="Unsupported"):
            fuzzify_symptom(0.5, sets)
