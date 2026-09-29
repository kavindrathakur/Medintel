# Engineering, Safety & Product Rules
## MedFA — Medical Diagnosis Using Fuzzy Automata

**Version:** 1.0  
**Last Updated:** September 29, 2026  
**Priority Order:** Safety > Correctness > Explainability > Privacy > Usability > Performance > Feature velocity

---

## 1. Non-Negotiable Medical Safety Rules

1. MedFA is a **research and decision-support prototype**, never an autonomous diagnostic system.
2. Every symptom-intake and result screen must display a visible disclaimer: "This tool is for decision support/research only and is not a substitute for professional medical advice, diagnosis, or treatment."
3. Never state or imply that a user definitely has, does not have, or is cured of any condition.
4. Use language such as "possible condition," "relevance score," and "may warrant clinical evaluation."
5. Never call the model output a confirmed diagnosis, probability, certainty, prescription, or treatment plan.
6. If configured emergency/red-flag inputs are present, prominently show: "Seek emergency medical care now" and do not downplay the warning because of ranking scores.
7. Do not provide medication doses, prescriptions, treatment instructions, or clinician-replacement advice.
8. All clinical rules must cite a source or be flagged as `research_only`; clinician review is required before a rule is labeled validated.

---

## 2. Scope Rules

1. MVP supports only **8-12 explicitly listed common conditions**; never imply comprehensive diagnostic coverage.
2. The system must list supported conditions and limitations clearly.
3. Inputs outside configured symptom ranges must be rejected or marked invalid; never silently clamp critical medical values.
4. Missing input is unknown, not absent. Do not convert blank symptoms to `0.0` without explicit user selection.
5. Output at least a ranked list only when the model has sufficient configured evidence; otherwise return an insufficient-information message.
6. Future ML/ANFIS features must remain optional and cannot replace explainability requirements.

---

## 3. Fuzzy Engine Correctness Rules

1. All fuzzy memberships, rule weights, transition values, and normalized diagnosis scores must remain in the closed range `[0.0, 1.0]`.
2. Core default composition method is **max-min**: `next[j] = max_i(min(current[i], transition[i][j]))`.
3. Any alternative composition method must be explicitly named in request/response metadata and tested separately.
4. Every diagnosis result must include an explanation trace of contributing symptoms and values.
5. Explainability must be derived from the actual evaluation path; never generate fictitious or generic explanations.
6. Rule IDs must be stable, unique, versioned, and included in evaluation trace logs (without personal data).
7. Rule updates require validation: valid symptom/condition IDs, weights in `[0,1]`, no duplicate rule identifiers.
8. Use deterministic evaluation for the same input, rule-base version, and composition method.
9. Round display values only at UI boundary; retain sufficient numeric precision internally.
10. Unit tests must include hand-computed max-min transition cases and boundary cases (0, 1, missing input).

---

## 4. Data, Privacy & Security Rules

1. Do not collect name, phone number, address, email, hospital ID, Aadhaar, date of birth, or any direct identifier.
2. Use age range where possible instead of exact date of birth.
3. Do not log raw symptom responses in production application logs.
4. Session history is anonymous, opt-in for persistence, and deletable by the user.
5. Default session retention is 7 days or less; document any change.
6. Use HTTPS in deployed environments.
7. Store secrets only in environment variables; never commit `.env`, API keys, database URLs, or credentials.
8. Restrict CORS to approved frontend origins in production.
9. Protect admin endpoints with authentication/authorization before public deployment.
10. Perform privacy/legal review before handling any real patient or clinical data.

---

## 5. API Rules

1. All routes must be namespaced under `/api/v1`.
2. Use Pydantic schemas for all input and output validation.
3. Return consistent JSON error structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": []
  }
}
```

4. Never expose stack traces, database details, secrets, or internal rule implementation in error responses.
5. Diagnosis responses must include: ranked results, confidence/relevance scores, contributions, missing-data metadata, rule-base version, and disclaimer.
6. API version changes that break clients require a new version prefix.
7. Validate numeric values, units, allowed enum values, and payload size before computation.
8. Rate-limit public endpoints before public release.

---

## 6. Frontend Rules

1. Follow `Design.md` exactly for colors, typography, components, and copy.
2. Use TypeScript strict mode; do not use `any` unless documented and unavoidable.
3. All form fields require visible labels and accessible error messaging.
4. Do not render results from mocked or stale data in production flows.
5. Always display loading, success, empty, validation-error, server-error, and offline states.
6. Use responsive design for minimum viewport width of 320px.
7. Do not use color as the only signal for confidence, errors, or status.
8. Do not use medical imagery or language that falsely increases perceived clinical validation.

---

## 7. Code Quality Rules

1. Python: use Python 3.11+, type hints, Ruff/Black formatting, and pytest.
2. TypeScript: strict mode, ESLint, Prettier, and Vitest/React Testing Library.
3. Keep business logic out of API route handlers and React page components.
4. The FFA engine must be framework-independent and callable from tests/notebooks without FastAPI.
5. One responsibility per module; avoid files over 300 lines unless justified.
6. Use descriptive names; avoid unexplained magic numbers, especially fuzzy thresholds.
7. Put configurable thresholds, condition definitions, and rule data in versioned configuration/data files.
8. Add tests for every bug fix and every new engine rule.
9. No merge/deployment with failing tests, linting, or type checks.

---

## 8. Testing & Evaluation Rules

1. Test membership functions at minimum, peak, maximum, and out-of-range values.
2. Test automaton transitions using manually verified examples.
3. Test missing 30-50% symptom fields without crash or fabricated certainty.
4. Test API validation, response schema, CORS, and error handling.
5. Test accessibility: keyboard navigation, focus, labels, contrast, screen-reader announcements.
6. Measure top-1 and top-3 agreement only against appropriate labeled test cases; do not claim clinical accuracy without formal validation.
7. Compare FFA against at least one baseline (plain fuzzy inference or decision tree) for research evaluation.
8. Keep training/validation/test data separated if ML features are introduced.

---

## 9. AI Collaboration Rules

1. Before changing implementation, read `PRD.md`, `Architecture.md`, `Design.md`, `Rules.md`, and `Tasks.md`.
2. Do not alter core medical-safety language, supported scope, or FFA math without explicit approval and documentation update.
3. Make minimal, focused changes; do not rewrite unrelated files.
4. When uncertain about clinical correctness, mark the rule/claim as needing expert validation rather than inventing medical knowledge.
5. Update `Tasks.md` when a phase task is completed or blocked.
6. Update documentation whenever API contracts, data models, design tokens, or architecture decisions change.
7. Preserve existing conventions and directory structure unless an architecture decision explicitly changes them.

---

## 10. Definition of Done

A feature is complete only when:

- Requirements and acceptance criteria are met
- Relevant tests pass
- Types/linting pass
- Accessibility requirements are verified
- Medical-safety and disclaimer requirements remain intact
- API/documentation changes are documented
- No PII or secrets are introduced
- Error, empty, and loading states are handled
