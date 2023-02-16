export type ValidationErrors = "CONFLICT";

export type ValidationResult = ValidationErrors | boolean;

export interface IColumnDefinition<TData extends IRowData> {
  key: string;
  header: string;
  editType?: "text" | "select";
  linkTo?: (row: TData) => string;
  validationFunction?: (row: TData, newValue: string) => ValidationResult;
  errorMessages?: Record<ValidationErrors, string>;
}

export interface IRowData {
  id: number;
  [key: string]: string | number;
}

export type TOnRowChangeFunction<TData extends IRowData> = (
  newRow: TData,
  setLoading: (isLoading: boolean) => void,
  setValidationResult: (result: { [key: string]: ValidationResult }) => void
) => void;

interface TableOptions {
  header: string;
  showActions?: boolean;
}

export interface DataTableProps<TData extends IRowData> {
  data: TData[];
  columnDefinitions: IColumnDefinition<TData>[];
  onRowChange?: TOnRowChangeFunction<TData>;
  options?: TableOptions;
}

export interface RowProps<TData extends IRowData> {
  row: TData;
  definitions: IColumnDefinition<TData>[];
  onRowChange?: TOnRowChangeFunction<TData>;
}

export interface CellProps<TData extends IRowData> {
  value: string | number;
  newValue: string | number;
  setNewValue: (newValue: string) => void;
  definition: IColumnDefinition<TData>;
  isEditing: boolean;
  validation: ValidationResult;
  linkTo?: string;
}
