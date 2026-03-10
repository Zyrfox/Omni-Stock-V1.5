import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a custom ID with prefix and zero-padded number, e.g. OUT-001 */
export function generateCustomId(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(3, "0")}`;
}

/** Three-Tier Status Logic */
export type StockStatus = "SAFE" | "WARNING" | "CRITICAL";

export function getStockStatus(
  stokAkhir: number,
  stokMinimum: number,
  leadTimeDays: number,
  avgDailyConsumption: number
): StockStatus {
  const reorderPoint = stokMinimum + leadTimeDays * avgDailyConsumption;

  if (stokAkhir <= stokMinimum) return "CRITICAL";
  if (stokAkhir <= reorderPoint) return "WARNING";
  return "SAFE";
}

export function getStatusColor(status: StockStatus): string {
  switch (status) {
    case "SAFE":
      return "text-green-600 bg-green-50 border-green-200";
    case "WARNING":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "CRITICAL":
      return "text-red-600 bg-red-50 border-red-200";
  }
}

export function getStatusEmoji(status: StockStatus): string {
  switch (status) {
    case "SAFE":
      return "🟢";
    case "WARNING":
      return "🟠";
    case "CRITICAL":
      return "🔴";
  }
}

export function getStatusLabel(status: StockStatus): string {
  switch (status) {
    case "SAFE":
      return "Safe";
    case "WARNING":
      return "Warning - Reorder Point";
    case "CRITICAL":
      return "Critical";
  }
}

/** Estimate days until stockout */
export function estimateDaysUntilStockout(
  stokAkhir: number,
  avgDailyConsumption: number
): number | null {
  if (avgDailyConsumption <= 0) return null;
  return Math.round((stokAkhir / avgDailyConsumption) * 10) / 10;
}
