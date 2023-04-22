import { Dropdown, Table } from "flowbite-react";
import DataCell from "./DataCell";
import HandleChangesButtons from "./HandleChangesButtons";
import type { IRowData, RowProps } from "./types";
import { useRow } from "./useRow";
import { HiOutlineTrash, HiDotsVertical } from "react-icons/hi";
import { useLayoutEffect, useRef, useState } from "react";
import { CustomAction } from "../";

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

  const actionsRef = useRef<HTMLDivElement>(null);
  const [isActionsOverflow, setIsActionsOverflow] = useState(false);

  useLayoutEffect(() => {
    if (!actionsRef.current) return;
    if (actionsRef.current.scrollWidth > actionsRef.current.clientWidth)
      setIsActionsOverflow(true);
  }, [actionsRef, row]);

  function EditAction() {
    return !isEditing ? (
      <>
        {options?.canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-blue-600 hover:underline dark:text-blue-500"
          >
            Редагувати
          </button>
        )}
        {((typeof options?.canRemove === "function" && options.canRemove(row)) ||
          options?.canRemove === true) && (
          <button
            type="button"
            onClick={() => onRowRemove?.(row)}
            className="flex h-8 w-8 shrink-0 p-1 text-red-700 hover:bg-gray-200 hover:text-red-800 dark:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-700"
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
      <Table.Cell className="w-[25%] font-medium">
        <div ref={actionsRef} className="inline-flex items-center gap-2">
          <>
            <EditAction />
            {!isEditing &&
              (isActionsOverflow ? (
                <Dropdown
                  label={<HiDotsVertical className="h-5 w-5" />}
                  inline={true}
                  arrowIcon={false}
                  placement="right"
                >
                  {options.customActions?.(row).map((a) =>
                    a.isVisible ? (
                      <Dropdown.Item key={a.text} icon={a.icon} onClick={a.onClick}>
                        {a.text}
                      </Dropdown.Item>
                    ) : (
                      <></>
                    )
                  )}
                </Dropdown>
              ) : (
                options
                  .customActions?.(row)
                  .map((a) => <CustomAction key={a.text} {...a} />)
              ))}
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
