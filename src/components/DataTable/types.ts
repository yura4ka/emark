import type { ReactNode } from "react";

export type ValidationErrors = "CONFLICT";

export type ValidationResult = ValidationErrors | boolean;

export interface IColumnDefinition<TData extends IRowData> {
  key: Extract<keyof TData, string>;
  header: string;
  editType?: "text" | "select";
  validationFunction?: (row: TData, newValue: string) => ValidationResult;
  errorMessages?: Record<ValidationErrors, string>;
  customElement?: (row: TData) => JSX.Element;
  isUnique?: boolean;
  nullable?: boolean;
  changeOptions?: TChangeOption[] | ((row: TData) => TChangeOption[]);
  idKey?: Extract<keyof TData, string>;
}

export interface IRowData {
  id: number;
  [key: string]: string | number | boolean;
}

export type TOnRowChangeFunction<TData extends IRowData> = (props: {
  newRow: TData;
  setLoading: (isLoading: boolean) => void;
  setValidation: (result: { [key: string]: ValidationResult }) => void;
  ids: Record<Extract<keyof TData, string>, number>;
}) => void;

interface TableOptions<TData extends IRowData> {
  header: string;
  showActions?: boolean;
  canEdit?: boolean;
  customActions?: (row: TData) => ReactNode;
  defaultRow?: TData;
}

export interface DataTableProps<TData extends IRowData> {
  data: TData[];
  columnDefinitions: IColumnDefinition<TData>[];
  onRowChange?: TOnRowChangeFunction<TData>;
  options?: TableOptions<TData>;
  onNewRowCreate?: TOnRowChangeFunction<TData>;
}

export interface RowProps<TData extends IRowData> {
  row: TData;
  definitions: IColumnDefinition<TData>[];
  options?: TableOptions<TData>;
  onRowChange?: TOnRowChangeFunction<TData>;
  uniqueCheck?: TCheckUniqueFunction<TData>;
}

export interface CellProps<TData extends IRowData> {
  value: string | number | boolean;
  newValue: string | number | boolean;
  setNewValue: (newValue: string, id: number) => void;
  definition: IColumnDefinition<TData>;
  isEditing: boolean;
  validation: ValidationResult;
  customElement?: JSX.Element;
  changeOptions?: {
    id: number;
    option: string;
  }[];
}

export interface NewRowProps<TData extends IRowData> {
  definitions: IColumnDefinition<TData>[];
  row: TData;
  onSave: TOnRowChangeFunction<TData> | undefined;
  uniqueCheck?: TCheckUniqueFunction<TData>;
}

export interface HandleChangeButtonsProps {
  isLoading: boolean;
  isError: boolean;
  handleSave: () => void;
  handleCancel: () => void;
}

export type TCheckUniqueFunction<TData extends IRowData> = (
  row: TData,
  key: Extract<keyof TData, string>,
  newValue: string
) => boolean;

export interface TChangeOption {
  id: number;
  option: string;
}
