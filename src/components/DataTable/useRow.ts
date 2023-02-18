import { useMemo, useState } from "react";
import type {
  IColumnDefinition,
  IRowData,
  TOnRowChangeFunction,
  ValidationResult,
} from "./types";
import { initValidations } from "./utils";

export function useRow<TData extends IRowData>(
  row: TData,
  onRowSave: TOnRowChangeFunction<TData> | undefined
) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newRow, setNewRow] = useState(() => ({ ...row }));
  const [rowValidations, setRowValidations] = useState(() => initValidations(row, true));

  const isError = useMemo(
    () => Object.values(rowValidations).some((v) => v !== true),
    [rowValidations]
  );

  function onNewValueChange(value: string, d: IColumnDefinition<TData>) {
    setNewRow((old) => ({ ...old, [d.key]: value }));
    if (d.validationFunction) {
      const result = d.validationFunction(row, value);
      setRowValidations((old) => ({ ...old, [d.key]: result }));
    }
  }

  function discard() {
    setNewRow({ ...row });
    setRowValidations(initValidations(row, true));
    setIsEditing(false);
  }

  function save() {
    if (!onRowSave) {
      discard();
      return;
    }

    let validation: ValidationResult[] = [];
    onRowSave(newRow, setIsLoading, (result) => {
      setRowValidations((old) => ({ ...old, ...result }));
      validation = Object.values(result);
    });
    setIsEditing(validation.length !== 0 || validation.some((r) => r !== true));
  }

  return {
    isEditing,
    setIsEditing,
    isLoading,
    setIsLoading,
    newRow,
    setNewRow,
    rowValidations,
    setRowValidations,
    isError,
    onNewValueChange,
    save,
    discard,
  };
}
