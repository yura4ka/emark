import { useMemo, useState } from "react";
import type {
  IColumnDefinition,
  IRowData,
  TCheckUniqueFunction,
  TOnRowChangeFunction,
  ValidationResult,
} from "./types";
import { initValidations } from "./utils";

export function useRow<TData extends IRowData>(
  row: TData,
  onRowSave: TOnRowChangeFunction<TData> | undefined,
  uniqueCheck?: TCheckUniqueFunction<TData>,
  definitions?: IColumnDefinition<TData>[]
) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newRow, setNewRow] = useState(() => ({ ...row }));
  const [rowValidations, setRowValidations] = useState(() => initValidations(row, true));
  const [selectedIds, setSelectedIds] = useState(
    () =>
      Object.fromEntries(
        Object.keys(row).map((k) => {
          const id = definitions?.find((d) => d.key === k)?.idKey || -1;
          return [k, id === -1 ? id : row[id]];
        })
      ) as Record<Extract<keyof TData, string>, number>
  );

  const isError = useMemo(
    () => Object.values(rowValidations).some((v) => v !== true),
    [rowValidations]
  );

  function onNewValueChange(value: string, d: IColumnDefinition<TData>, id?: number) {
    if (id !== undefined) setSelectedIds((old) => ({ ...old, [d.key]: id }));

    setNewRow((old) => ({ ...old, [d.key]: value }));
    if (!d.nullable) {
      const isEmpty = value.trim().length === 0;
      setRowValidations((old) => ({ ...old, [d.key]: !isEmpty }));
      if (isEmpty) return;
    }

    if (d.isUnique && uniqueCheck) {
      const result = uniqueCheck(row, d.key, value);
      setRowValidations((old) => ({
        ...old,
        [d.key]: result === false ? d.errorMessages?.CONFLICT : true,
      }));
      if (!result) return;
    }

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
    onRowSave({
      newRow,
      setLoading: setIsLoading,
      ids: selectedIds,
      setValidation: (result) => {
        setRowValidations((old) => ({ ...old, ...result }));
        validation = Object.values(result);
      },
    });

    const isSuccess = !(validation.length !== 0 || validation.some((r) => r !== true));
    setIsEditing(!isSuccess);
    if (isSuccess) setNewRow({ ...row });
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
    setSelectedIds,
  };
}
