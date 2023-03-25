import { Table } from "flowbite-react";
import DataNewInstanceRow from "./DataNewInstanceRow";
import DataRow from "./DataRow";
import type { DataTableProps, IRowData, TCheckUniqueFunction } from "./types";
import { HiOutlinePlus, HiSearch } from "react-icons/hi";
import Link from "next/link";
import { useMemo, useState } from "react";

export function createTableProps<TData extends IRowData>(props: DataTableProps<TData>) {
  return props;
}

function TableSearch({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <div className="bg-white pb-4 dark:bg-gray-900">
      <label htmlFor="table-search" className="sr-only">
        Search
      </label>
      <div className="relative mt-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <HiSearch className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          id="table-search"
          className="block w-80 rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="Пошук"
        />
      </div>
    </div>
  );
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

  const [searchQuery, setSearchQuery] = useState("");
  const filtered = useMemo(() => {
    if (!options?.enableSearch) return null;
    if (searchQuery.trim().length === 0) return data;

    const queries = searchQuery
      .split(";")
      .map((q) => q.trim().toLowerCase())
      .filter((q) => q.length !== 0);

    return data.filter((row) =>
      queries.every((q) =>
        Object.entries(row).some(([key, value]) => {
          const definition = columnDefinitions.find((d) => d.key === key);
          if (!definition) return false;

          const searchBy = definition.searchBy;
          if (typeof searchBy === "function") return searchBy(row);
          const words = value.toString().trim().toLowerCase().split(" ");
          return searchBy !== false && words.some((w) => w.length > 0 && w.startsWith(q));
        })
      )
    );
  }, [options?.enableSearch, searchQuery, data, columnDefinitions]);

  return (
    <div className="container my-3">
      {options?.header && <h2 className="mb-6 text-2xl font-bold">{options.header}</h2>}
      {options?.enableSearch && (
        <TableSearch value={searchQuery} setValue={setSearchQuery} />
      )}
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
          {(filtered || data).map((row) => (
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
