export type UserRole = "STUDENT" | "MENTOR" | "ADMIN" | "INVESTOR";

export type MathLevel = "beginner" | "intermediate" | "advanced" | "research";

export type CourseDifficulty = "beginner" | "intermediate" | "advanced";

export type CourseTopic =
  | "algebra"
  | "analysis"
  | "topology"
  | "geometry"
  | "probability"
  | "logic"
  | "physics"
  | "biology"
  | "cs"
  | "other";

export type LessonType = "lecture" | "exercise" | "game" | "quiz";

export type ConferenceField =
  | "mathematics"
  | "physics"
  | "biology"
  | "cs"
  | "interdisciplinary";

export type ConferenceTier = "A*" | "A" | "B" | "C";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  bio?: string | null;
  institution?: string | null;
  country?: string | null;
}

export interface CourseCard {
  id: string;
  title: string;
  description: string;
  topic: CourseTopic;
  difficulty: CourseDifficulty;
  tags: string[];
  isOpen: boolean;
  mentor: {
    id: string;
    name: string;
    avatar?: string | null;
    institution?: string | null;
  };
  _count?: {
    enrollments: number;
    lessons: number;
  };
}

export interface ConferenceInfo {
  id: string;
  name: string;
  shortName?: string | null;
  description?: string | null;
  field: ConferenceField;
  subfield?: string | null;
  location: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  website?: string | null;
  isTop: boolean;
  tier: ConferenceTier;
}

export const TOPIC_LABELS: Record<string, string> = {
  algebra: "Алгебра",
  analysis: "Математический анализ",
  topology: "Топология",
  geometry: "Геометрия",
  probability: "Теория вероятностей",
  logic: "Математическая логика",
  physics: "Физика",
  biology: "Математическая биология",
  cs: "Информатика",
  other: "Другое",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Начинающий",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

export const FIELD_LABELS: Record<string, string> = {
  mathematics: "Математика",
  physics: "Физика",
  biology: "Биология",
  cs: "Информатика",
  interdisciplinary: "Мультидисциплинарная",
};

export const TIER_COLORS: Record<string, string> = {
  "A*": "bg-purple-100 text-purple-700",
  A: "bg-blue-100 text-blue-700",
  B: "bg-slate-100 text-slate-700",
  C: "bg-gray-100 text-gray-600",
};
