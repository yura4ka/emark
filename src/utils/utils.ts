export function formatOptional(n: number) {
  return n <= 0 ? null : n;
}
export function formatDate(date = new Date()) {
  return [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
  ].join("-");
}

export function clampMark(value: number, min?: number, max?: number, notZero = true) {
  min ??= value;
  max ??= value;
  if (value === 0 && notZero) return 1;
  return Math.min(Math.max(value, min), max);
}

export const initialPassword = {
  value: "",
  confirm: "",
  isCorrect: true,
};

export function calculateColor(score: number, maxScore: number) {
  const ratio = score / maxScore;
  if (ratio <= 0.3) return "text-red-500";
  if (ratio < 0.7) return "text-yellow-500";
  return "text-green-500";
}
