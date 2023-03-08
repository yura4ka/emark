import { Table } from "flowbite-react";
import DataCell from "./DataCell";
import HandleChangesButtons from "./HandleChangesButtons";
import type { IRowData, RowProps } from "./types";
import { useRow } from "./useRow";

export default function DataRow<TData extends IRowData>({
  row,
  definitions,
  onRowChange,
  options,
  uniqueCheck,
}: RowProps<TData>) {
  const {
    isEditing,
    setIsEditing,
    isLoading,
    newRow,
    rowValidations,
    isError,
    onNewValueChange,
    discard,
    save,
  } = useRow(row, onRowChange, uniqueCheck);

  function EditAction() {
    return !isEditing ? (
      <button onClick={() => setIsEditing(true)} className="p-1 hover:underline">
        Редагувати
      </button>
    ) : (
      <HandleChangesButtons
        {...{ isLoading, isError, handleSave: save, handleCancel: discard }}
      />
    );
  }

  function RowActions() {
    if (!options?.showActions) return null;
    return (
      <Table.Cell className="w-[25%] font-medium text-blue-600 dark:text-blue-500">
        <div className="inline-flex gap-2">
          <>
            {options.canEdit && <EditAction />}
            {!isEditing && options.customActions?.(row)}
          </>
        </div>
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
          setNewValue={(value, id) => onNewValueChange(value, d, id)}
          definition={d}
          isEditing={isEditing}
          validation={rowValidations[d.key] || true}
          customElement={d.customElement ? d.customElement(row) : undefined}
          changeOptions={
            typeof d.changeOptions === "function" ? d.changeOptions(row) : d.changeOptions
          }
        />
      ))}
      <RowActions />
    </Table.Row>
  );
}
