import { Table } from "flowbite-react";
import DataCell from "./DataCell";
import type { IRowData, NewRowProps } from "./types";
import { HiOutlinePlus } from "react-icons/hi";
import HandleChangesButtons from "./HandleChangesButtons";
import { useRow } from "./useRow";

function DataNewInstanceRow<TData extends IRowData>({
  definitions,
  row,
  onSave,
  uniqueCheck,
}: NewRowProps<TData>) {
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
  } = useRow(row, onSave, uniqueCheck, true);

  return !isEditing ? (
    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <td
        colSpan={definitions.length + 1}
        className="whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
      >
        <button
          onClick={() => setIsEditing(true)}
          className="flex w-full items-center justify-center px-6 py-3 font-semibold hover:bg-gray-50 hover:text-blue-500 dark:hover:bg-gray-600"
        >
          <HiOutlinePlus className="mr-2 h-5 w-5" />
          Створити
        </button>
      </td>
    </Table.Row>
  ) : (
    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <>
        {definitions.map((d) => (
          <DataCell
            key={d.header}
            value={newRow[d.key] || ""}
            newValue={newRow[d.key] || ""}
            setNewValue={(value, id) => onNewValueChange(value, d, id)}
            definition={d}
            isEditing={true}
            validation={rowValidations[d.key] || true}
            customElement={d.customElement ? d.customElement(row) : undefined}
            changeOptions={
              typeof d.changeOptions === "function"
                ? d.changeOptions(row)
                : d.changeOptions
            }
          />
        ))}
      </>
      <Table.Cell className="w-[25%] font-medium text-blue-600 dark:text-blue-500">
        <div className="inline-flex gap-2">
          <HandleChangesButtons
            {...{ isLoading, isError, handleSave: save, handleCancel: discard }}
          />
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

export default DataNewInstanceRow;
