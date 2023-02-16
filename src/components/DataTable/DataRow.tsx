import { Button, Table } from "flowbite-react";
import { useMemo, useState } from "react";
import { HiCheck, HiX } from "react-icons/hi";
import DataCell from "./DataCell";
import type { IColumnDefinition, IRowData, RowProps, ValidationResult } from "./types";

export default function DataRow<TData extends IRowData>({
  row,
  definitions,
  onRowChange,
}: RowProps<TData>) {
  const initNewRowData = () => ({ ...row });
  const initValidations = (value: ValidationResult) =>
    Object.fromEntries(Object.keys(row).map((k) => [k, value]));

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newRow, setNewRow] = useState(() => initNewRowData());
  const [rowValidations, setRowValidations] = useState(() => initValidations(true));

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
    setNewRow(initNewRowData());
    setRowValidations(initValidations(true));
    setIsEditing(false);
  }

  function save() {
    if (!onRowChange) {
      discard();
      return;
    }

    let validation: ValidationResult[] = [];
    onRowChange(newRow, setIsLoading, (result) => {
      setRowValidations((old) => ({ ...old, ...result }));
      validation = Object.values(result);
    });
    setIsEditing(validation.length !== 0 || validation.some((r) => r !== true));
  }

  function RowActions() {
    return (
      <Table.Cell className="w-[25%] font-medium text-blue-600 dark:text-blue-500">
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="p-1 hover:underline">
            Редагувати
          </button>
        ) : (
          <div className="inline-flex gap-2">
            <Button
              onClick={() => save()}
              disabled={isLoading || isError}
              size="xs"
              color="success"
            >
              <HiCheck className="mr-1 h-4 w-4" />
              Зберегти
            </Button>
            <Button
              onClick={() => discard()}
              disabled={isLoading}
              size="xs"
              color="failure"
            >
              <HiX className="mr-1 h-4 w-4" />
              Скасувати
            </Button>
          </div>
        )}
      </Table.Cell>
    );
  }

  return (
    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
      {definitions.map((d) => (
        <DataCell
          key={d.header}
          value={row[d.key] || ""}
          newValue={newRow[d.key] || ""}
          setNewValue={(value) => onNewValueChange(value, d)}
          definition={d}
          isEditing={isEditing}
          validation={rowValidations[d.key] || true}
          linkTo={d.linkTo ? d.linkTo(row) : undefined}
        />
      ))}
      <RowActions />
    </Table.Row>
  );
}
