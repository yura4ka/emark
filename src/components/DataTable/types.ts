import type { ReactNode } from "react";

export type ValidationErrors = "CONFLICT";

export type ValidationResult = ValidationErrors | boolean;

export interface IColumnDefinition<TData extends IRowData> {
  key: string;
  header: string;
  editType?: "text" | "select";
  validationFunction?: (row: TData, newValue: string) => ValidationResult;
  errorMessages?: Record<ValidationErrors, string>;
  customElement?: (row: TData) => JSX.Element;
}

export interface IRowData {
  id: number;
  [key: string]: string | number | boolean;
}

export type TOnRowChangeFunction<TData extends IRowData> = (
  newRow: TData,
  setLoading: (isLoading: boolean) => void,
  setValidationResult: (result: { [key: string]: ValidationResult }) => void
) => void;

interface TableOptions<TData extends IRowData> {
  header: string;
  showActions?: boolean;
  canEdit?: boolean;
  customActions?: (row: TData) => ReactNode;
}

export interface DataTableProps<TData extends IRowData> {
  data: TData[];
  columnDefinitions: IColumnDefinition<TData>[];
  onRowChange?: TOnRowChangeFunction<TData>;
  options?: TableOptions<TData>;
}

export interface RowProps<TData extends IRowData> {
  row: TData;
  definitions: IColumnDefinition<TData>[];
  options?: TableOptions<TData>;
  onRowChange?: TOnRowChangeFunction<TData>;
}

export interface CellProps<TData extends IRowData> {
  value: string | number | boolean;
  newValue: string | number | boolean;
  setNewValue: (newValue: string) => void;
  definition: IColumnDefinition<TData>;
  isEditing: boolean;
  validation: ValidationResult;
  customElement?: JSX.Element;
}
