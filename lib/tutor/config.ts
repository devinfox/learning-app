export const TUTOR_ENABLED = true as const;

export const COURSE_ANALYSIS_ENABLED = true as const;

export const LEARNER_MEMORY_WRITE_ENABLED = true as const;

export const TUTOR_DISABLED_MESSAGE = "The UVBrain teacher is currently unavailable.";

export function isTutorEnabled(): boolean {
  return TUTOR_ENABLED;
}

export function isCourseAnalysisEnabled(): boolean {
  return COURSE_ANALYSIS_ENABLED;
}

export function isMemoryWriteEnabled(): boolean {
  return LEARNER_MEMORY_WRITE_ENABLED;
}

export const MEMORY_CONFIDENCE_FLOOR = 0.4;

export const MAX_MEMORIES_IN_PROMPT = 12;

export const MEMORY_STALE_AFTER_DAYS = 120;

export const PLAN_EXPIRES_AFTER_DAYS = 21;
export const LIFE_EXPIRES_AFTER_DAYS = 120;

export const FOLLOW_UP_WINDOW_DAYS = 10;

export const MAX_FOLLOW_UPS_IN_PROMPT = 2;
