# Product Requirements Document (PRD)
## MedFA — Medical Diagnosis Under Uncertainty Using Fuzzy Automata

**Version:** 1.0  
**Created:** September 29, 2026  
**Owner:** [Your Name]  
**Status:** Active Development  

---

## 1. Executive Summary

MedFA is a decision-support system that models medical diagnosis as a **Fuzzy Finite Automaton (FFA)**, handling imprecise symptoms ("mild fever," "occasional pain") to produce ranked differential diagnoses with confidence scores and explainability.

---

## 2. Problem Statement

Real patient data is inherently vague. Classical diagnostic systems force fuzzy reality into binary branches, losing valuable partial information. MedFA solves this using fuzzy automata where symptoms drive **degrees of membership** across candidate diagnoses.

---

## 3. Goals & Objectives

### Primary Goals
- ✅ Model diagnostic reasoning as Fuzzy Finite Automaton (FFA)
- ✅ Handle incomplete, imprecise, or conflicting symptom input
- ✅ Output **ranked list of diagnoses with confidence scores** (not single verdict)
- ✅ Provide **explainability**: which symptoms drove which diagnosis
- ✅ Build interactive web application for demo/thesis/portfolio

### Success Metrics
- **Accuracy**: Top-3 diagnoses match ground truth in test set
- **Explainability**: Every output has traceable symptom contribution breakdown
- **Usability**: Complete symptom entry → result in <2 minutes
- **Robustness**: Produces ranked output with 30-50% missing data

---

## 4. Technical Model

### 4.1 Fuzzy Finite Automaton (FFA) Definition

A fuzzy automaton generalizes classical 5-tuple (Q, Σ, δ, q₀, F):

| Component | Classical | Fuzzy (MedFA) |
|-----------|-----------|---------------|
| **States (Q)** | Discrete states | Diagnostic checkpoints / candidate conditions |
| **Alphabet (Σ)** | Discrete symbols | Symptoms with **fuzzy membership functions** [0,1] |
| **Transition (δ)** | δ: Q×Σ→Q | δ: Q×Σ×Q→[0,1] — degree of transition |
| **Start state** | Single q₀ | Fuzzy distribution over initial states |
| **Accepting states (F)** | Crisp set | Disease-states with final **membership scores** |

### 4.2 Processing Pipeline

1. **Fuzzification** — Convert raw input to membership values (triangular/trapezoidal functions)
2. **State Initialization** — Assign initial fuzzy membership vector across diagnoses
3. **Transition** — Apply fuzzy transition using **max-min composition** (configurable)
4. **Rule Base** — Fuzzy rules from clinical literature or learned from dataset
5. **Aggregation & Ranking** — Normalize and sort → ranked differential diagnosis
6. **Explainability** — Trace symptom contributions to each diagnosis score

### 4.3 Why Fuzzy Automata?

- **vs. Plain Fuzzy Logic**: Adds state-machine structure for multi-stage triage
- **vs. Black-box ML**: Stays interpretable — every transition traceable to rule
- **Novel Contribution**: Stateful fuzzy inference (not just Mamdani/Sugeno)

---

## 5. Scope

### In Scope (MVP)
- Web application with symptom intake form
- Fuzzy automaton engine (Python backend)
- 8-12 common conditions (e.g., flu, migraine, GERD, anxiety)
- Ranked diagnosis output with confidence %
- Explainability panel showing symptom contributions
- Editable rule base (admin view)
- Session history for demo/testing

### Out of Scope (v1)
- ❌ Regulatory-grade medical device certification
- ❌ EHR/patient records system
- ❌ Mobile app (web-first approach)
- ❌ Real-time clinician feedback loop

### Future Scope (v2+)
- ANFIS-style learning from labeled datasets
- Multi-stage triage visualization (automaton diagram)
- PDF case report export
- Clinician tuning interface

---

## 6. Target Users

- **Primary**: Researchers, students (thesis/demo/portfolio)
- **Secondary**: Clinicians (decision-support prototype)
- **Tertiary**: Patients (educational tool only)

---

## 7. Key Features

### MVP Features
1. Symptom intake form (sliders, toggles, numeric vitals)
2. Real-time fuzzy automaton computation
3. Ranked differential diagnosis with confidence bars
4. Explainability panel ("Driven by: fever 0.42, fatigue 0.31...")
5. Admin rule base editor
6. Session history

### Stretch Features
- Learn transition weights from data
- Visual automaton state diagram
- PDF export
- Multi-language support

---

## 8. Constraints & Assumptions

### Constraints
- **Medical Liability**: Must include prominent disclaimer (not a substitute for professional advice)
- **Data Quality**: Rule base requires clinical expert review or validated dataset
- **Scope**: Limited to 8-12 conditions in MVP

### Assumptions
- Users have basic medical knowledge or are supervised
- Internet access available for web app
- Python 3.9+ environment for backend

---

## 9. Dependencies

- **Clinical Validation**: Domain expert review or DDXPlus dataset
- **Fuzzy Math**: NumPy for matrix operations
- **Deployment**: Vercel/Netlify (frontend), Render/Railway (backend)

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Medical misuse | High | Prominent disclaimer; decision-support only |
| Inaccurate rule base | High | Clinician review; validated dataset |
| Fuzzy automaton complexity | Medium | Timebox; 2-state POC before scaling |
| Dataset scarcity | Medium | Scope to common conditions (8-12) |

---

## 11. Glossary

- **FFA**: Fuzzy Finite Automaton
- **Membership Function**: Maps symptom severity to [0,1] value
- **Max-Min Composition**: Fuzzy transition operator
- **ANFIS**: Adaptive Neuro-Fuzzy Inference System
- **DDXPlus**: Public symptom-diagnosis dataset

---

## 12. References

- Fuzzy Automata Theory: [Standard references]
- Medical Diagnosis Systems: [Clinical decision support literature]
- DDXPlus Dataset: [Public dataset link]

---

*Disclaimer: This tool is for research/decision-support only, not a certified medical device.*
