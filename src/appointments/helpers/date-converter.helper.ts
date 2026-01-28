/**
 * Converts a value that can be a Date or string to an ISO string.
 * If the value is already a string, returns it as-is.
 * If the value is a Date, converts it to ISO string.
 * Returns undefined if the value is null or undefined.
 */
export function toIsoString(
  value: Date | string | null | undefined,
): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}
