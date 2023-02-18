import type { IRowData, ValidationResult } from "./types";

export function initValidations<TData extends IRowData>(
  row: TData,
  value: ValidationResult
) {
  return Object.fromEntries(Object.keys(row).map((k) => [k, value])) as Record<
    keyof TData,
    ValidationResult
  >;
}
