import { useMemo, useState } from "react";
import type {
  IColumnDefinition,
  IRowData,
  TCheckUniqueFunction,
  TOnRowChangeFunction,
} from "./types";
import { initValidations } from "./utils";

export function useRow<TData extends IRowData>(
  row: TData,
  onRowSave: TOnRowChangeFunction<TData> | undefined,
  definitions: IColumnDefinition<TData>[],
  uniqueCheck?: TCheckUniqueFunction<TData>,
  isNew?: boolean
) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newRow, setNewRow] = useState(() => ({ ...row }));
  const [rowValidations, setRowValidations] = useState(() => initValidations(row, true));

  const isError = useMemo(
    () => Object.values(rowValidations).some((v) => v !== true),
    [rowValidations]
  );

  function onNewValueChange(value: string, d: IColumnDefinition<TData>, id?: number) {
    setNewRow((old) => ({ ...old, [d.key]: value, ...(d.idKey && { [d.idKey]: id }) }));
    if (!d.nullable) {
      const isEmpty = value.trim().length === 0;
      setRowValidations((old) => ({ ...old, [d.key]: !isEmpty }));
      if (isEmpty) return;
    }

    if (d.isUnique && uniqueCheck) {
      const result = uniqueCheck(row, d.key, value);
      setRowValidations((old) => ({
        ...old,
        [d.key]: result === false ? "CONFLICT" : true,
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

    setIsLoading(true);
    onRowSave({
      newRow,
      setResult: (result) => {
        setIsLoading(false);
        if (result === true || result === undefined) {
          setIsEditing(false);
          if (isNew) setNewRow({ ...row });
          return;
        }

        if (result == false)
          setRowValidations((prev) => {
            const validation = { ...prev };
            definitions.forEach((d) => (validation[d.key] = result));
            return validation;
          });
        else setRowValidations((prev) => ({ ...prev, ...result }));

        const validation = result && Object.values(result);
        const isSuccess = !(
          !validation ||
          validation.length !== 0 ||
          validation.some((r) => r !== true)
        );
        setIsEditing(!isSuccess);
        if (isSuccess && isNew) setNewRow({ ...row });
      },
    });
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
