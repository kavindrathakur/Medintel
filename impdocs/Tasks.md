# Project Tasks & Delivery Plan
## MedFA — Medical Diagnosis Under Uncertainty Using Fuzzy Automata

**Version:** 1.0  
**Last Updated:** September 29, 2026  
**Project status:** Planned  
**Estimated MVP duration:** 9 weeks  

---

## How to Use This File

- Mark completed work by changing `[ ]` to `[x]`.
- Record blockers directly below the affected task using: `**Blocker:** description`.
- Follow the phase order. Do not start public deployment before safety, testing, and privacy tasks are complete.
- Read `PRD.md`, `Architecture.md`, `Design.md`, and `Rules.md` before implementation work.

---

## Phase 0 — Scope & Research

**Goal:** Lock the MVP scope, supported conditions, and research framing before coding.  
**Estimated duration:** Week 1

### Deliverables
- A documented list of 8–12 supported conditions.
- A documented symptom list and input units.
- A research-ready formal definition of the Fuzzy Finite Automaton.

### Tasks
- [ ] Confirm MedFA is a research/decision-support prototype, not a medical device or autonomous diagnostic product.
- [ ] Select 8–12 common conditions for the MVP.
- [ ] Define inclusion and exclusion criteria for each supported condition.
- [ ] Identify red-flag/emergency symptoms and define safe escalation messaging.
- [ ] Identify a suitable curated symptom–diagnosis data source or clinical literature references.
- [ ] Obtain clinician/domain-expert review plan; mark all unreviewed rules as `research_only`.
- [ ] Define patient input variables: symptom names, input types, units, min/max ranges, and optionality.
- [ ] Define demographic fields allowed in MVP; avoid direct identifiers.
- [ ] Write the formal FFA definition: states, fuzzy alphabet, initial vector, transition relation, accepting states.
- [ ] Choose default composition method: max-min composition.
- [ ] Define baseline evaluation method: plain fuzzy inference or decision tree.
- [ ] Update `PRD.md` if MVP scope changes.

### Acceptance Criteria
- Supported conditions are explicitly named and limited to 8–12.
- Every input has a type, unit/range, and missing-data behavior.
- Red-flag handling is defined before UI/backend implementation.
- FFA math and baseline method are documented.

---

## Phase 1 — Repository & Development Setup

**Goal:** Create a clean, reproducible codebase and local development environment.  
**Estimated duration:** Week 1

### Deliverables
- Monorepo with `frontend/`, `backend/`, and `docs/` structure.
- Local frontend and backend startup instructions.
- CI checks for formatting, linting, types, and tests.

### Tasks
- [ ] Initialize Git repository and protect the main branch.
- [ ] Add project documentation under `docs/`: PRD, Architecture, Design, Rules, Tasks.
- [ ] Create backend folder structure specified in `Architecture.md`.
- [ ] Create Next.js frontend with TypeScript strict mode.
- [ ] Configure Python 3.11+ virtual environment and dependency management.
- [ ] Install backend dependencies: FastAPI, Uvicorn, Pydantic, NumPy, pytest, Ruff, Black.
- [ ] Install frontend dependencies: Next.js, React, Tailwind CSS, Lucide React, Recharts, Vitest, Testing Library.
- [ ] Add `.env.example`; ensure `.env` is ignored by Git.
- [ ] Configure ESLint, Prettier, and TypeScript checks.
- [ ] Configure Ruff, Black, pytest, and type checking for Python.
- [ ] Add Dockerfiles and `docker-compose.yml` for local full-stack development.
- [ ] Add basic CI workflow: backend tests, frontend tests, linting, formatting, and type checks.
- [ ] Create root `README.md` with setup, run, test, and safety disclaimer instructions.

### Acceptance Criteria
- `frontend` and `backend` run locally with documented commands.
- All quality checks run in CI.
- No secrets, database credentials, or `.env` files are committed.

---

## Phase 2 — Fuzzy Automaton Proof of Concept

**Goal:** Implement and validate a minimal, framework-independent FFA engine.  
**Estimated duration:** Weeks 2–3

### Deliverables
- Pure Python FFA module.
- Membership-function library.
- Unit-tested two-state proof of concept.
- Jupyter notebook showing manually verified calculations.

### Tasks
- [ ] Implement triangular membership function.
- [ ] Implement trapezoidal membership function.
- [ ] Add validation that membership values remain within `[0.0, 1.0]`.
- [ ] Implement fuzzy state-vector initialization.
- [ ] Implement max-min composition: `next[j] = max_i(min(current[i], transition[i][j]))`.
- [ ] Implement optional product-max composition behind a configuration option.
- [ ] Create `FuzzyAutomaton` class independent of FastAPI and database code.
- [ ] Define stable IDs for states, symptoms, fuzzy sets, and rules.
- [ ] Build a two-state proof of concept with hand-computed expected output.
- [ ] Add tests for zero, one, intermediate, and invalid values.
- [ ] Add tests for matrix dimension mismatch and unknown state IDs.
- [ ] Create a notebook demonstrating fuzzification, transition, and ranking calculations.
- [ ] Record rule-base version in every engine evaluation result.

### Acceptance Criteria
- Identical input, rules, and composition method always produce identical output.
- Hand-computed test cases match engine results.
- The engine handles missing values explicitly without treating them as absent symptoms.
- All core engine unit tests pass.

---

## Phase 3 — Rule Base & Clinical Data Design

**Goal:** Build a transparent, versioned rule base for the selected MVP conditions.  
**Estimated duration:** Weeks 3–4

### Deliverables
- Versioned `fuzzy_sets.json` and `default_rules.json`.
- Condition, symptom, fuzzy-set, and rule schemas.
- Clinical/research provenance for every rule.

### Tasks
- [ ] Define condition catalogue: ID, name, category, description, status, and scope note.
- [ ] Define symptom catalogue: ID, label, input control, range, unit, and grouping.
- [ ] Define fuzzy linguistic labels for each numeric symptom, e.g., low/moderate/high fever.
- [ ] Set triangular/trapezoidal parameters for each fuzzy set.
- [ ] Define condition states and intermediate triage states if used.
- [ ] Create initial-state strategy: uniform default plus optional configured demographic priors.
- [ ] Encode transition rules with source state, symptom/fuzzy set, target state, weight, source, reviewer, and status.
- [ ] Mark rules without expert review as `research_only`.
- [ ] Validate all weights and fuzzy outputs are in `[0.0, 1.0]`.
- [ ] Add schema validation for JSON configuration files.
- [ ] Add rule-version metadata and changelog.
- [ ] Design emergency/red-flag rule configuration separate from diagnosis ranking.
- [ ] Review rules with clinician/domain expert where possible.
- [ ] Create representative sample cases for each supported condition.

### Acceptance Criteria
- Every rule is traceable to a source or explicitly labeled research-only.
- Configuration passes schema validation.
- No unsupported condition can appear in results.
- Red-flag rules can trigger safety messaging independently of diagnosis confidence.

---

## Phase 4 — Explainability & Ranking

**Goal:** Turn raw FFA output into clear, auditable differential-diagnosis results.  
**Estimated duration:** Week 4

### Deliverables
- Normalized ranked diagnosis output.
- Symptom-contribution trace per diagnosis.
- Missing-data and limitation metadata.

### Tasks
- [ ] Implement normalization and ranking of final disease-state scores.
- [ ] Define display format: relevance/confidence score and percent representation.
- [ ] Ensure UI/API language never treats score as confirmed probability or certainty.
- [ ] Implement contribution tracing from evaluated rules and transitions.
- [ ] Calculate top contributing symptoms for each returned condition.
- [ ] Include triggering rule IDs and rule-base version in internal trace data.
- [ ] Detect insufficient evidence and return a safe no-result/limitations response.
- [ ] Count missing and completed symptom fields.
- [ ] Add lower-confidence messaging when input completeness is low.
- [ ] Unit-test ranking order, score ranges, ties, missing data, and contribution sums/trace validity.

### Acceptance Criteria
- Each diagnosis has a score, rank, contributors, and limitations metadata.
- Explanations are generated from actual engine operations, not template-only text.
- Missing data reduces certainty messaging without causing crashes or fabricated claims.

---

## Phase 5 — Backend API & Persistence

**Goal:** Expose the engine through a validated, secure FastAPI service.  
**Estimated duration:** Weeks 5–6

### Deliverables
- Versioned REST API under `/api/v1`.
- OpenAPI documentation.
- Anonymous session support.
- Rule-base read/edit API prepared for protected admin access.

### Tasks
- [ ] Create FastAPI application entry point and configuration module.
- [ ] Implement `GET /api/v1/health`.
- [ ] Implement `GET /api/v1/conditions`.
- [ ] Implement `GET /api/v1/symptoms`.
- [ ] Implement `POST /api/v1/diagnoses/evaluate`.
- [ ] Define Pydantic request schema for demographics, symptoms, and composition method.
- [ ] Define Pydantic response schema for diagnoses, contributors, warnings, completeness, disclaimer, and rule version.
- [ ] Add input range, unit, enum, and payload-size validation.
- [ ] Implement consistent JSON error response format.
- [ ] Integrate FFA engine through a dedicated diagnosis service.
- [ ] Add SQLite database for development sessions and rule data if required.
- [ ] Create SQLAlchemy models and database migrations.
- [ ] Implement anonymous session creation/retrieval/deletion endpoints.
- [ ] Add session expiration cleanup policy (default 7 days or less).
- [ ] Implement admin rule read/update endpoints.
- [ ] Add admin authentication/authorization before exposing rule update endpoints publicly.
- [ ] Configure CORS for local development and approved production origin only.
- [ ] Ensure all diagnosis responses include disclaimer text.
- [ ] Add API tests for valid, invalid, incomplete, red-flag, and server-error scenarios.

### Acceptance Criteria
- API is documented automatically through FastAPI OpenAPI.
- Invalid inputs return safe validation errors without stack traces.
- No direct identifiers are persisted or logged.
- Every response from diagnosis evaluation contains safety disclaimer and limitations metadata.

---

## Phase 6 — Frontend Foundation & Symptom Intake

**Goal:** Build an accessible, responsive user experience following `Design.md`.  
**Estimated duration:** Weeks 6–7

### Deliverables
- Design tokens and reusable UI components.
- Symptom intake page.
- API client with validation, loading, error, and retry states.

### Tasks
- [ ] Configure Tailwind tokens exactly as specified in `Design.md`.
- [ ] Add Inter font and defined fallback fonts.
- [ ] Create app shell: header, footer, content container, disclaimer area.
- [ ] Build reusable button, card, alert, input, slider, toggle, progress, and badge components.
- [ ] Build symptom-group navigation and progress indicator.
- [ ] Build demographics section with optional/non-identifying fields only.
- [ ] Build numeric vital input controls with units and inline validation.
- [ ] Build severity sliders displaying label, numeric value, and unit where applicable.
- [ ] Build present/not-present controls with explicit labels.
- [ ] Preserve user-entered inputs after API/network failure.
- [ ] Implement frontend API client and typed API models.
- [ ] Add loading state: "Analyzing symptom pattern…".
- [ ] Add offline, timeout, validation-error, and server-error states.
- [ ] Display medical disclaimer on symptom intake page.
- [ ] Ensure keyboard navigation, visible focus, labels, and screen-reader support.
- [ ] Test responsive layouts from 320px mobile through desktop.

### Acceptance Criteria
- A new user can enter symptoms without instructions.
- All inputs have visible labels, help text where needed, and accessible errors.
- No diagnosis result is shown from stale/mock data during production flow.
- UI meets documented color, typography, and spacing standards.

---

## Phase 7 — Results, Explainability & History UI

**Goal:** Present ranked results without overstating medical certainty.  
**Estimated duration:** Week 7

### Deliverables
- Results page with diagnosis cards.
- Explainability display.
- Anonymous session history page.

### Tasks
- [ ] Build `/results` page and safely handle missing/expired session state.
- [ ] Build ranked diagnosis result card.
- [ ] Display rank, condition name, description, score percentage, relevance label, and progress bar.
- [ ] Build expandable "Why this result?" contributor panel.
- [ ] Show missing-input count and limitations panel.
- [ ] Show emergency/red-flag banner before all routine result cards when triggered.
- [ ] Display prominent decision-support disclaimer on results page.
- [ ] Add "Start a new assessment" action.
- [ ] Build `/history` page for anonymous saved sessions.
- [ ] Add individual session delete and clear-all-history confirmation flow.
- [ ] Add `aria-live="polite"` result announcements and reduced-motion behavior.
- [ ] Ensure color is not the only indicator of confidence/relevance.
- [ ] Add UI tests for results, explainability, red-flag state, empty history, and deletion confirmation.

### Acceptance Criteria
- Each result is understandable without interpreting the automata math.
- Every listed condition has an evidence/contribution view.
- Safety notices and disclaimers cannot be hidden or visually minimized.

---

## Phase 8 — Admin Rule Editor

**Goal:** Provide a controlled research interface for rule inspection and updates.  
**Estimated duration:** Week 8

### Deliverables
- Protected admin rule editor.
- Rule validation and confirmation workflow.
- Rule version tracking.

### Tasks
- [ ] Build `/admin/rules` page with research-configuration warning.
- [ ] Display rule table: ID, symptom, source state, target state, weight, source, status, version.
- [ ] Add search and filters by symptom, condition, and validation status.
- [ ] Build rule edit form with 0.0–1.0 weight validation.
- [ ] Require confirmation before saving updates.
- [ ] Show clear validation errors for invalid IDs, duplicate rules, or invalid weights.
- [ ] Require authenticated admin access before production deployment.
- [ ] Record editor, timestamp, before/after values, and reason for rule changes where persistence supports it.
- [ ] Prevent rule changes from silently modifying completed-session results; retain evaluated rule-base version.
- [ ] Add frontend and backend tests for admin authorization and validation.

### Acceptance Criteria
- Rule changes cannot be saved outside allowed schemas/ranges.
- Admin functionality is inaccessible to unauthenticated public users.
- Rule-base version is visible and preserved in diagnosis output.

---

## Phase 9 — Testing, Evaluation & Hardening

**Goal:** Demonstrate reliability, safety behavior, usability, and research value.  
**Estimated duration:** Week 8–9

### Deliverables
- Test report.
- Baseline comparison results.
- Usability/safety checklist.
- Bug-fix backlog resolved or documented.

### Tasks
- [ ] Run full unit-test suite for membership functions, transitions, ranking, and explainability.
- [ ] Run integration tests from frontend input to backend diagnosis response.
- [ ] Test 30%, 40%, and 50% missing symptom fields.
- [ ] Test out-of-range inputs, invalid units, malformed payloads, and unknown symptoms.
- [ ] Test all configured red-flag pathways.
- [ ] Test session expiration, deletion, and absence of PII persistence.
- [ ] Test API error responses do not expose stack traces or secrets.
- [ ] Perform accessibility testing: keyboard-only, focus, contrast, labels, and screen-reader announcements.
- [ ] Perform responsive testing at 320px, 640px, 768px, 1024px, and 1440px.
- [ ] Create held-out representative test cases.
- [ ] Evaluate top-1 and top-3 agreement on the scoped dataset/cases.
- [ ] Compare FFA results with selected baseline method.
- [ ] Document limitations: dataset size, condition scope, rule-review status, and non-clinical validation.
- [ ] Fix critical/high bugs before deployment.
- [ ] Create a final manual QA checklist and complete it.

### Acceptance Criteria
- All automated checks pass.
- Red-flag safety behavior is verified.
- No unsupported clinical accuracy claims appear in product, demo, or documentation.
- Evaluation is documented with clear limitations.

---

## Phase 10 — Deployment & Demo Preparation

**Goal:** Deploy a secure demo and prepare thesis/portfolio presentation materials.  
**Estimated duration:** Week 9

### Deliverables
- Public or private demo URL.
- Production environment configuration.
- Demo script and technical documentation.

### Tasks
- [ ] Choose deployment mode: Vercel frontend + Render/Railway backend, or single Docker deployment.
- [ ] Configure production environment variables and database connection.
- [ ] Configure production CORS and HTTPS.
- [ ] Deploy frontend.
- [ ] Deploy backend.
- [ ] Run production health check.
- [ ] Verify public API does not expose admin routes without authentication.
- [ ] Configure database backups if persistent production database is used.
- [ ] Configure monitoring without collecting raw symptom data.
- [ ] Create demo data that is synthetic and non-identifying.
- [ ] Prepare 2–3 safe demonstration cases, including incomplete-input and explainability examples.
- [ ] Prepare one emergency/red-flag demonstration that emphasizes escalation, not diagnosis.
- [ ] Write presentation narrative: problem → FFA model → architecture → demo → evaluation → limitations.
- [ ] Update README with deployed URL, setup, limitations, and safety disclaimer.
- [ ] Tag MVP release in Git.

### Acceptance Criteria
- Production demo loads over HTTPS and passes a smoke test.
- Disclaimers, privacy rules, and error handling work in production.
- Demo materials accurately state the prototype's limitations.

---

## Post-MVP — Version 2 Backlog

Do not start these until MVP is stable, evaluated, and reviewed.

- [ ] Add automaton graph visualization showing activated states and transitions.
- [ ] Add clinician feedback workflow with separate review queue.
- [ ] Add ANFIS-style learning experiments using strictly separated training/validation/test data.
- [ ] Compare learned weights versus expert-defined weights.
- [ ] Add PDF case-report export with visible disclaimer and no direct identifiers.
- [ ] Add multi-language interface support with medically reviewed translations.
- [ ] Add role-based authentication for researchers and clinicians.
- [ ] Add richer analytics using only aggregate, non-identifying data.
- [ ] Review regulatory, privacy, and clinical-validation requirements before real-world patient deployment.

---

## MVP Release Checklist

- [ ] Supported-condition list is fixed and displayed.
- [ ] Every diagnosis result has traceable symptom contributors.
- [ ] Medical disclaimer is visible on intake and results pages.
- [ ] Emergency/red-flag rules show appropriate urgent-care messaging.
- [ ] No PII collection or unsafe production logging.
- [ ] API input/output validation is complete.
- [ ] Engine, backend, frontend, and accessibility tests pass.
- [ ] Missing-data behavior has been tested through 50% missing fields.
- [ ] Evaluation against a baseline is documented.
- [ ] Deployment uses HTTPS, restricted CORS, and protected admin routes.
- [ ] README, architecture, rules, design, and task documentation are current.
