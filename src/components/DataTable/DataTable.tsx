import { Table } from "flowbite-react";
import DataNewInstanceRow from "./DataNewInstanceRow";
import DataRow from "./DataRow";
import type { DataTableProps, IRowData, TCheckUniqueFunction } from "./types";
import { HiOutlinePlus } from "react-icons/hi";
import Link from "next/link";

export function createTableProps<TData extends IRowData>(props: DataTableProps<TData>) {
  return props;
}

function DataTable<TData extends IRowData>({
  data,
  columnDefinitions,
  onRowChange,
  options,
  onNewRowCreate,
}: DataTableProps<TData>) {
  const checkUniqueConstraint: TCheckUniqueFunction<TData> = (row, key, newValue) => {
    return !data.some((r) => r[key] === newValue.trim() && r.id !== row.id);
  };

  return (
    <div className="container my-3">
      {options?.header && <h2 className="mb-6 text-2xl font-bold">{options.header}</h2>}
      <Table>
        <Table.Head>
          {columnDefinitions.map((d) => (
            <Table.HeadCell key={d.key}>{d.header}</Table.HeadCell>
          ))}
          {options?.showActions && <Table.HeadCell>Дії</Table.HeadCell>}
        </Table.Head>
        <Table.Body className="divide-y">
          {options?.createOnNewPage && (
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <td
                colSpan={columnDefinitions.length + 1}
                className="whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
              >
                <Link
                  href={options.createOnNewPage}
                  className="flex w-full items-center justify-center px-6 py-3 font-semibold hover:bg-gray-50 hover:text-blue-500 dark:hover:bg-gray-600"
                >
                  <HiOutlinePlus className="mr-2 h-5 w-5" />
                  Створити
                </Link>
              </td>
            </Table.Row>
          )}
          {options?.defaultRow && (
            <DataNewInstanceRow
              definitions={columnDefinitions}
              row={options?.defaultRow}
              onSave={onNewRowCreate}
              uniqueCheck={checkUniqueConstraint}
            />
          )}
          {data.map((row) => (
            <DataRow
              key={row.id}
              row={row}
              definitions={columnDefinitions}
              onRowChange={onRowChange}
              options={options}
              uniqueCheck={checkUniqueConstraint}
            />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
export default DataTable;
