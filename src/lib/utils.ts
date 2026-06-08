import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: "Новичок",
    2: "Ученик",
    3: "Студент",
    4: "Бакалавр",
    5: "Магистр",
    6: "Аспирант",
    7: "Кандидат",
    8: "Доктор",
    9: "Профессор",
    10: "Академик",
  };
  return titles[Math.min(level, 10)] ?? "Легенда";
}

export function xpForNextLevel(level: number): number {
  return level * 200;
}
