import { Table } from "flowbite-react";
import DataRow from "./DataRow";
import type { DataTableProps, IRowData } from "./types";

export function createTableProps<TData extends IRowData>(props: DataTableProps<TData>) {
  return props;
}

function DataTable<TData extends IRowData>({
  data,
  columnDefinitions,
  onRowChange,
  options,
}: DataTableProps<TData>) {
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
          {data.map((row) => (
            <DataRow
              key={row.id}
              row={row}
              definitions={columnDefinitions}
              onRowChange={onRowChange}
            />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
export default DataTable;
