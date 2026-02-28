import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatPrice(
  minorAmount: string | number,
  currencySymbol: string,
  decimalPlaces: number = 2
): string {
  const amount = Number(minorAmount) / Math.pow(10, decimalPlaces)
  return `${currencySymbol}${amount.toFixed(decimalPlaces)}`
}

export function truncate(str: string, length: number): string {
  return str.length <= length ? str : `${str.slice(0, length)}…`
}
