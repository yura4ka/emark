import { Table } from "flowbite-react";
import DataNewInstanceRow from "./DataNewInstanceRow";
import DataRow from "./DataRow";
import type { DataTableProps, IRowData, TCheckUniqueFunction } from "./types";

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
