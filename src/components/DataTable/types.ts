import type { FC, SVGProps } from "react";

export type ValidationErrors = "CONFLICT" | "FORMAT";

export type ValidationResult = ValidationErrors | boolean;

export interface IColumnDefinition<TData extends IRowData> {
  key: Extract<keyof TData, string>;
  header: string;
  editType?: "text" | "select";
  validationFunction?: (row: TData, newValue: string) => ValidationResult;
  errorMessages?: Partial<Record<ValidationErrors, string>>;
  customElement?: (row: TData) => JSX.Element;
  isUnique?: boolean;
  nullable?: boolean;
  changeOptions?: TChangeOption[] | ((row: TData) => TChangeOption[]);
  idKey?: Extract<keyof TData, string>;
  searchBy?: boolean | ((row: TData) => boolean);
  isMain?: boolean;
}

export interface IRowData {
  id: number;
  [key: string]: string | number | boolean;
}

export type TOnRowChangeFunction<TData extends IRowData> = (props: {
  newRow: TData;
  setResult: (result?: boolean | { [key: string]: ValidationResult }) => void;
}) => void;

export interface CustomActionProps {
  isVisible: boolean;
  isLoading: boolean;
  text: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  onClick: () => void;
  color?: string;
}

interface TableOptions<TData extends IRowData> {
  header: string;
  showActions?: boolean;
  canEdit?: boolean;
  customActions?: (row: TData) => CustomActionProps[];
  defaultRow?: TData;
  createOnNewPage?: string;
  enableSearch?: boolean;
  canRemove?: boolean | ((row: TData) => boolean);
}

type TOnRowRemoveFunction<TData extends IRowData> = (row: TData) => void;

export interface DataTableProps<TData extends IRowData> {
  data: TData[];
  columnDefinitions: IColumnDefinition<TData>[];
  onRowChange?: TOnRowChangeFunction<TData>;
  options?: TableOptions<TData>;
  onNewRowCreate?: TOnRowChangeFunction<TData>;
  onRowRemove?: TOnRowRemoveFunction<TData>;
}

export interface RowProps<TData extends IRowData> {
  row: TData;
  definitions: IColumnDefinition<TData>[];
  options?: TableOptions<TData>;
  onRowChange?: TOnRowChangeFunction<TData>;
  uniqueCheck?: TCheckUniqueFunction<TData>;
  onRowRemove?: TOnRowRemoveFunction<TData>;
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
