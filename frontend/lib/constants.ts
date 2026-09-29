/* ============================================================
   MedFA Constants
   Source: Design.md, Rules.md §1
   ============================================================ */

export const MEDICAL_DISCLAIMER =
  "This tool is for decision support/research only and is not a substitute for professional medical advice, diagnosis, or treatment.";

export const EMERGENCY_MESSAGE =
  "Seek emergency medical care now.";

// Symptom groups for the intake form (Design.md §7.1)
export const SYMPTOM_GROUPS = [
  { id: "general", label: "General", icon: "Activity" },
  { id: "respiratory", label: "Respiratory", icon: "Wind" },
  { id: "cardiac", label: "Cardiac", icon: "Heart" },
  { id: "digestive", label: "Digestive", icon: "Utensils" },
  { id: "neurological", label: "Neurological", icon: "Brain" },
] as const;

// Confidence level thresholds (Design.md §3)
export const CONFIDENCE_THRESHOLDS = {
  HIGHER: 70,
  MODERATE: 40,
} as const;

// Default symptoms for the intake form
export const DEFAULT_SYMPTOMS = [
  // General
  { symptom_id: "temperature_c", label: "Body Temperature", input_type: "numeric" as const, unit: "°C", min: 35.0, max: 42.0, step: 0.1, group: "general", description: "Current body temperature" },
  { symptom_id: "fatigue", label: "Fatigue", input_type: "slider" as const, min: 0, max: 1, step: 0.1, group: "general", description: "Level of tiredness or exhaustion" },
  { symptom_id: "body_ache", label: "Body Ache", input_type: "slider" as const, min: 0, max: 1, step: 0.1, group: "general", description: "Generalized body pain" },
  { symptom_id: "chills", label: "Chills", input_type: "toggle" as const, group: "general", description: "Feeling of coldness with shivering" },

  // Respiratory
  { symptom_id: "cough", label: "Cough", input_type: "slider" as const, min: 0, max: 1, step: 0.1, group: "respiratory", description: "Severity of cough" },
  { symptom_id: "sore_throat", label: "Sore Throat", input_type: "slider" as const, min: 0, max: 1, step: 0.1, group: "respiratory", description: "Throat pain or irritation" },
  { symptom_id: "shortness_of_breath", label: "Shortness of Breath", input_type: "slider" as const, min: 0, max: 1, step: 0.1, group: "respiratory", description: "Difficulty breathing" },
  { symptom_id: "nasal_congestion", label: "Nasal Congestion", input_type: "toggle" as const, group: "respiratory", description: "Blocked or stuffy nose" },

  // Cardiac
  { symptom_id: "chest_pain", label: "Chest Pain", input_type: "slider" as const, min: 0, max: 1, step: 0.1, group: "cardiac", description: "Pain or pressure in the chest" },
  { symptom_id: "heart_rate_bpm", label: "Heart Rate", input_type: "numeric" as const, unit: "bpm", min: 40, max: 200, step: 1, group: "cardiac", description: "Resting heart rate" },
  { symptom_id: "palpitations", label: "Palpitations", input_type: "toggle" as const, group: "cardiac", description: "Irregular or pounding heartbeat" },

  // Digestive
  { symptom_id: "nausea", label: "Nausea", input_type: "slider" as const, min: 0, max: 1, step: 0.1, group: "digestive", description: "Feeling of wanting to vomit" },
  { symptom_id: "abdominal_pain", label: "Abdominal Pain", input_type: "slider" as const, min: 0, max: 1, step: 0.1, group: "digestive", description: "Pain in the stomach area" },
  { symptom_id: "acid_reflux", label: "Acid Reflux", input_type: "toggle" as const, group: "digestive", description: "Burning sensation in chest/throat from stomach acid" },
  { symptom_id: "appetite_loss", label: "Appetite Loss", input_type: "toggle" as const, group: "digestive", description: "Reduced desire to eat" },

  // Neurological
  { symptom_id: "headache", label: "Headache", input_type: "slider" as const, min: 0, max: 1, step: 0.1, group: "neurological", description: "Head pain" },
  { symptom_id: "dizziness", label: "Dizziness", input_type: "slider" as const, min: 0, max: 1, step: 0.1, group: "neurological", description: "Lightheadedness or vertigo" },
  { symptom_id: "concentration_difficulty", label: "Difficulty Concentrating", input_type: "toggle" as const, group: "neurological", description: "Trouble focusing or brain fog" },
  { symptom_id: "sleep_disturbance", label: "Sleep Disturbance", input_type: "toggle" as const, group: "neurological", description: "Trouble sleeping or insomnia" },
];
