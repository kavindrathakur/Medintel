# System Architecture
## MedFA — Medical Diagnosis Using Fuzzy Automata

**Version:** 1.0  
**Last Updated:** September 29, 2026

---

## 1. Architecture Overview

MedFA uses a **three-tier web architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React / Next.js Frontend                                    │
│  Symptom Form • Results Dashboard • Admin Rule Editor        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST JSON
┌──────────────────────────▼──────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  Python FastAPI Backend                                      │
│  API Routes • Validation • Session Management                │
└──────────────────────────┬──────────────────────────────────┘
                           │ Python Function Calls
┌──────────────────────────▼──────────────────────────────────┐
│                    DOMAIN / ENGINE LAYER                     │
│  Custom Fuzzy Finite Automaton Engine                        │
│  Fuzzification • Transitions • Ranking • Explanation         │
└──────────────────────────┬──────────────────────────────────┘
                           │ Read / Write
┌──────────────────────────▼──────────────────────────────────┐
│                     DATA LAYER                               │
│  SQLite/PostgreSQL • JSON Rule Files • Session Store         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Decisions

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | Next.js + TypeScript | Type safety, React ecosystem, easy Vercel deployment |
| Styling | Tailwind CSS | Consistent design tokens, rapid UI development |
| Backend | Python 3.11 + FastAPI | High performance, automatic API docs, native ML/fuzzy ecosystem |
| Fuzzy Math | NumPy | Efficient matrix operations for max-min composition |
| Validation | Pydantic v2 | API schema validation and type safety |
| Database | SQLite (dev), PostgreSQL (prod) | Simple MVP; production scalability |
| ORM | SQLAlchemy | Database abstraction and migrations |
| Charts | Recharts | React-native confidence/ranking charts |
| Testing | pytest + Vitest | Backend and frontend test coverage |
| Container | Docker | Consistent deployment environment |

---

## 3. Repository Structure

```
medfa/
├── docs/
│   ├── PRD.md
│   ├── Architecture.md
│   ├── Design.md
│   ├── Rules.md
│   └── Tasks.md
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Home / symptom intake
│   │   ├── results/page.tsx         # Diagnosis results
│   │   ├── history/page.tsx         # Session history
│   │   └── admin/rules/page.tsx     # Rule base editor
│   ├── components/
│   │   ├── symptoms/
│   │   ├── diagnosis/
│   │   ├── explainability/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/api.ts
│   ├── types/index.ts
│   └── tailwind.config.ts
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point
│   │   ├── api/
│   │   │   ├── diagnosis.py
│   │   │   ├── rules.py
│   │   │   ├── sessions.py
│   │   │   └── health.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── constants.py
│   │   ├── engine/
│   │   │   ├── fuzzy_automaton.py   # Core FFA class
│   │   │   ├── membership.py        # Fuzzy membership functions
│   │   │   ├── transitions.py       # Max-min composition
│   │   │   ├── rules.py             # Rule evaluation
│   │   │   ├── ranking.py           # Normalize/sort output
│   │   │   └── explainability.py    # Attribution tracing
│   │   ├── models/
│   │   │   ├── schemas.py           # Pydantic request/response models
│   │   │   └── database.py          # SQLAlchemy models
│   │   ├── services/
│   │   │   ├── diagnosis_service.py
│   │   │   ├── rule_service.py
│   │   │   └── session_service.py
│   │   └── data/
│   │       ├── default_rules.json
│   │       └── fuzzy_sets.json
│   ├── tests/
│   │   ├── test_membership.py
│   │   ├── test_automaton.py
│   │   ├── test_ranking.py
│   │   └── test_api.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 4. Backend Engine Architecture

### 4.1 Core FFA Data Flow

```
Patient Input
     │
     ▼
┌───────────────┐
│ Input Validator│ ── Pydantic schemas validate range/type
└───────┬───────┘
        ▼
┌───────────────┐
│ Fuzzification │ ── Raw values → membership degrees [0,1]
└───────┬───────┘
        ▼
┌───────────────┐
│ Initial State │ ── Diagnosis vector (uniform or demographic prior)
└───────┬───────┘
        ▼
┌───────────────┐
│ Rule Evaluator│ ── Select symptom-specific transition matrices
└───────┬───────┘
        ▼
┌───────────────┐
│ FFA Transition│ ── Max-min composition; update state vector
└───────┬───────┘
        ▼
┌───────────────┐
│ Aggregation   │ ── Normalize score vector
└───────┬───────┘
        ├──────────────────┐
        ▼                  ▼
┌───────────────┐   ┌───────────────┐
│ Ranking Output│   │ Explainability│
└───────────────┘   └───────────────┘
```

### 4.2 Core Mathematical Operations

For current membership vector `A`, transition matrix `R`, and target state `j`:

```
A_next[j] = max_i(min(A[i], R[i][j]))
```

Alternative configurable composition:

```
A_next[j] = max_i(A[i] × R[i][j])
```

All membership scores remain in range **[0.0, 1.0]**.

---

## 5. API Contract

### Base URL

```
/api/v1
```

### Core Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health status check |
| POST | `/diagnoses/evaluate` | Submit symptoms, receive ranked diagnoses |
| GET | `/conditions` | List supported conditions |
| GET | `/symptoms` | List available symptoms and input metadata |
| GET | `/rules` | Read fuzzy rule base (admin) |
| PUT | `/rules/{rule_id}` | Update a fuzzy rule (admin) |
| POST | `/sessions` | Save anonymous demo session |
| GET | `/sessions/{id}` | Retrieve session result |

### Diagnosis Request

```json
{
  "demographics": {"age": 32, "sex": "female", "risk_factors": []},
  "symptoms": {
    "temperature_c": 38.4,
    "fatigue": 0.7,
    "headache": 0.5,
    "chest_pain": 0.0
  },
  "composition_method": "max_min"
}
```

### Diagnosis Response

```json
{
  "session_id": "uuid",
  "diagnoses": [
    {
      "condition_id": "influenza",
      "condition_name": "Influenza",
      "confidence": 0.78,
      "confidence_percent": 78,
      "contributors": [
        {"symptom": "fever", "contribution": 0.42},
        {"symptom": "fatigue", "contribution": 0.31}
      ]
    }
  ],
  "warnings": ["Decision-support only. Consult a licensed clinician."],
  "missing_symptom_count": 3
}
```

---

## 6. Data Model

### Primary Entities

| Entity | Key Fields | Storage |
|--------|------------|---------|
| Condition | id, name, description, category | Database/JSON |
| Symptom | id, name, input_type, unit, min, max | Database/JSON |
| FuzzySet | id, symptom_id, label, function, parameters | JSON/Database |
| FuzzyRule | id, symptom_id, source_state, target_state, weight | Database/JSON |
| DiagnosisSession | id, anonymous inputs, result, created_at | Database |
| Contribution | diagnosis_id, symptom_id, value | Generated per evaluation |

### Example Fuzzy Set

```json
{
  "symptom_id": "temperature_c",
  "label": "moderate_fever",
  "function": "triangular",
  "parameters": [37.5, 38.5, 39.5]
}
```

---

## 7. Security & Privacy Architecture

- No authentication required in MVP; admin routes must be protected before public deployment.
- Do not collect personally identifiable information (name, phone, address, identifiers).
- Store only anonymous demo sessions with expiry/deletion policy.
- Use HTTPS in all deployed environments.
- Configure CORS only for approved frontend origin.
- Keep secrets in environment variables; never commit `.env` files.
- Medical disclaimer must be returned in every diagnosis response and displayed in UI.

---

## 8. Deployment Architecture

```
User Browser
    │
    ▼
Vercel (Next.js Frontend)
    │ HTTPS REST API
    ▼
Render / Railway (FastAPI + Docker)
    │
    ├── PostgreSQL (production sessions/rules)
    └── JSON seed files (default fuzzy sets/rules)
```

### Environment Variables

```env
ENVIRONMENT=development
API_V1_PREFIX=/api/v1
DATABASE_URL=sqlite:///./medfa.db
CORS_ORIGINS=http://localhost:3000
SESSION_RETENTION_DAYS=7
ADMIN_API_KEY=change_me_before_production
```

---

## 9. Observability

- Structured backend logs: request ID, endpoint, execution time, errors; never log symptom data in production.
- `/health` endpoint returns service readiness.
- Track aggregate non-identifying metrics: request count, average evaluation duration, missing-field ratio.
- Add error monitoring (e.g., Sentry) only after privacy review.
