"""
Fuzzy membership functions for the MedFA engine.

Supports triangular and trapezoidal membership functions that map
raw symptom values to fuzzy membership degrees in [0.0, 1.0].
"""

from __future__ import annotations

import numpy as np


def triangular(x: float, a: float, b: float, c: float) -> float:
    """Compute triangular membership degree.

    Parameters
    ----------
    x : float
        Input value to fuzzify.
    a : float
        Left foot of the triangle (membership = 0).
    b : float
        Peak of the triangle (membership = 1).
    c : float
        Right foot of the triangle (membership = 0).

    Returns
    -------
    float
        Membership degree in [0.0, 1.0].

    Raises
    ------
    ValueError
        If parameters violate a <= b <= c.
    """
    if not (a <= b <= c):
        raise ValueError(f"Triangular parameters must satisfy a <= b <= c, got a={a}, b={b}, c={c}")

    if x <= a or x >= c:
        return 0.0
    if x == b:
        return 1.0
    if a < x < b:
        return float((x - a) / (b - a))
    # b < x < c
    return float((c - x) / (c - b))


def trapezoidal(x: float, a: float, b: float, c: float, d: float) -> float:
    """Compute trapezoidal membership degree.

    Parameters
    ----------
    x : float
        Input value to fuzzify.
    a : float
        Left foot (membership = 0).
    b : float
        Left shoulder (membership = 1 begins).
    c : float
        Right shoulder (membership = 1 ends).
    d : float
        Right foot (membership = 0).

    Returns
    -------
    float
        Membership degree in [0.0, 1.0].

    Raises
    ------
    ValueError
        If parameters violate a <= b <= c <= d.
    """
    if not (a <= b <= c <= d):
        raise ValueError(
            f"Trapezoidal parameters must satisfy a <= b <= c <= d, "
            f"got a={a}, b={b}, c={c}, d={d}"
        )

    if x <= a or x >= d:
        return 0.0
    if b <= x <= c:
        return 1.0
    if a < x < b:
        return float((x - a) / (b - a))
    # c < x < d
    return float((d - x) / (d - c))


def fuzzify_symptom(
    value: float | None,
    fuzzy_sets: list[dict],
) -> dict[str, float]:
    """Fuzzify a single symptom value against its defined fuzzy sets.

    Parameters
    ----------
    value : float or None
        Raw symptom value. None means the symptom was not provided.
    fuzzy_sets : list of dict
        Each dict has keys: ``label``, ``function``, ``parameters``.

    Returns
    -------
    dict
        Mapping of fuzzy-set label to membership degree.
        If value is None, all memberships are returned as None (unknown).
    """
    result: dict[str, float | None] = {}

    for fs in fuzzy_sets:
        label = fs["label"]
        func = fs["function"]
        params = fs["parameters"]

        if value is None:
            result[label] = None
            continue

        if func == "triangular":
            result[label] = triangular(value, *params)
        elif func == "trapezoidal":
            result[label] = trapezoidal(value, *params)
        else:
            raise ValueError(f"Unsupported membership function type: {func}")

    return result


def fuzzify_all_symptoms(
    symptom_values: dict[str, float | None],
    fuzzy_sets_config: dict[str, list[dict]],
) -> dict[str, dict[str, float | None]]:
    """Fuzzify all provided symptom values.

    Parameters
    ----------
    symptom_values : dict
        Mapping of symptom_id to raw value (or None if not provided).
    fuzzy_sets_config : dict
        Mapping of symptom_id to list of fuzzy set definitions.

    Returns
    -------
    dict
        Nested dict: symptom_id -> fuzzy_label -> membership degree.
    """
    fuzzified: dict[str, dict[str, float | None]] = {}

    for symptom_id, sets in fuzzy_sets_config.items():
        raw_value = symptom_values.get(symptom_id)
        fuzzified[symptom_id] = fuzzify_symptom(raw_value, sets)

    return fuzzified
