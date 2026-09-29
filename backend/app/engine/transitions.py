"""
Fuzzy transition operations for the MedFA engine.

Implements max-min and max-product composition for fuzzy state-vector
transitions as defined in the Architecture.md.
"""

from __future__ import annotations

import numpy as np


def max_min_composition(
    state_vector: np.ndarray,
    transition_matrix: np.ndarray,
) -> np.ndarray:
    """Apply max-min composition to advance the fuzzy state vector.

    For each target state j:
        next[j] = max_i(min(state[i], transition[i][j]))

    Parameters
    ----------
    state_vector : np.ndarray
        Current fuzzy membership vector of shape (n_states,).
    transition_matrix : np.ndarray
        Transition matrix of shape (n_states, n_states) with values in [0, 1].

    Returns
    -------
    np.ndarray
        Updated state vector of shape (n_states,), values in [0.0, 1.0].

    Raises
    ------
    ValueError
        If dimensions are incompatible.
    """
    n_states = state_vector.shape[0]
    if transition_matrix.shape != (n_states, n_states):
        raise ValueError(
            f"Transition matrix shape {transition_matrix.shape} incompatible "
            f"with state vector of length {n_states}"
        )

    # Broadcasting: state_vector[:, None] is (n, 1), transition_matrix is (n, n)
    # min across paired elements, then max along source-state axis
    pairwise_min = np.minimum(state_vector[:, np.newaxis], transition_matrix)
    result = np.max(pairwise_min, axis=0)

    return np.clip(result, 0.0, 1.0)


def max_product_composition(
    state_vector: np.ndarray,
    transition_matrix: np.ndarray,
) -> np.ndarray:
    """Apply max-product composition to advance the fuzzy state vector.

    For each target state j:
        next[j] = max_i(state[i] * transition[i][j])

    Parameters
    ----------
    state_vector : np.ndarray
        Current fuzzy membership vector of shape (n_states,).
    transition_matrix : np.ndarray
        Transition matrix of shape (n_states, n_states) with values in [0, 1].

    Returns
    -------
    np.ndarray
        Updated state vector of shape (n_states,), values in [0.0, 1.0].

    Raises
    ------
    ValueError
        If dimensions are incompatible.
    """
    n_states = state_vector.shape[0]
    if transition_matrix.shape != (n_states, n_states):
        raise ValueError(
            f"Transition matrix shape {transition_matrix.shape} incompatible "
            f"with state vector of length {n_states}"
        )

    pairwise_product = state_vector[:, np.newaxis] * transition_matrix
    result = np.max(pairwise_product, axis=0)

    return np.clip(result, 0.0, 1.0)


COMPOSITION_METHODS = {
    "max_min": max_min_composition,
    "max_product": max_product_composition,
}


def apply_composition(
    method: str,
    state_vector: np.ndarray,
    transition_matrix: np.ndarray,
) -> np.ndarray:
    """Apply the named composition method.

    Parameters
    ----------
    method : str
        One of 'max_min' or 'max_product'.
    state_vector : np.ndarray
        Current state vector.
    transition_matrix : np.ndarray
        Transition matrix.

    Returns
    -------
    np.ndarray
        Updated state vector.

    Raises
    ------
    ValueError
        If the method name is not recognized.
    """
    if method not in COMPOSITION_METHODS:
        raise ValueError(
            f"Unknown composition method '{method}'. "
            f"Available: {list(COMPOSITION_METHODS.keys())}"
        )
    return COMPOSITION_METHODS[method](state_vector, transition_matrix)
