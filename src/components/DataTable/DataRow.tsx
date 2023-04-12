import { Table } from "flowbite-react";
import DataCell from "./DataCell";
import HandleChangesButtons from "./HandleChangesButtons";
import type { IRowData, RowProps } from "./types";
import { useRow } from "./useRow";
import { HiOutlineTrash } from "react-icons/hi";

export default function DataRow<TData extends IRowData>({
  row,
  definitions,
  onRowChange,
  options,
  uniqueCheck,
  onRowRemove,
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
  } = useRow(row, onRowChange, definitions, uniqueCheck);

  function EditAction() {
    return !isEditing ? (
      <>
        {options?.canEdit && (
          <button onClick={() => setIsEditing(true)} className="p-1 hover:underline">
            Редагувати
          </button>
        )}
        {((typeof options?.canRemove === "function" && options.canRemove(row)) ||
          options?.canRemove === true) && (
          <button
            type="button"
            onClick={() => onRowRemove?.(row)}
            className="flex h-8 w-8 p-1 text-red-700 hover:bg-gray-200 hover:text-red-800 dark:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-700"
          >
            <HiOutlineTrash className="h-full w-full" />
          </button>
        )}
      </>
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
            <EditAction />
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
          validation={rowValidations[d.key]}
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
