import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Payments in are stored as "UPI/GPay" (older records); the app calls the method "UPI" everywhere.
export const paymentMethodLabel = (method) => (method === 'UPI/GPay' ? 'UPI' : method);
