import Link from "next/link";
import type { CellProps, IRowData } from "./types";

export default function DataCell<TData extends IRowData>({
  value,
  definition,
  isEditing,
  newValue,
  setNewValue,
  validation,
  linkTo,
}: CellProps<TData>) {
  const isError = validation !== true;

  function onNewValueChange(newValue: string) {
    setNewValue(newValue);
  }

  return (
    <td
      className={`whitespace-nowrap px-6 font-medium text-gray-900 dark:text-white ${
        isError ? "pt-4 pb-2" : "py-4"
      }`}
    >
      {!isEditing ? (
        linkTo ? (
          <Link href={linkTo} className="hover:underline">
            {value}
          </Link>
        ) : (
          value
        )
      ) : (
        <>
          {definition.editType === "text" ? (
            <input
              value={newValue}
              onChange={(e) => onNewValueChange(e.target.value)}
              autoFocus={true}
              type={"text"}
              className={`block w-full whitespace-nowrap border-0 border-b p-0 py-2 pl-1 text-sm text-gray-900 focus:ring-0 dark:bg-gray-800 dark:text-white ${
                isError
                  ? "border-red-600 text-red-600 focus:border-red-600 dark:border-red-500 dark:text-red-500 dark:focus:border-red-500"
                  : "focus:border-blue-600 focus:text-blue-600 dark:border-slate-300 dark:focus:border-blue-500 dark:focus:text-blue-500"
              }`}
            />
          ) : (
            <select></select>
          )}
          {typeof validation === "string" && definition.errorMessages && (
            <span className="text-sm text-red-600 dark:text-red-500">
              {definition.errorMessages[validation]}
            </span>
          )}
        </>
      )}
    </td>
  );
}
