import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableToolbar } from "@/components/ui/data-table/data-toolbar";
import { ScrollArea, ScrollBar } from "./scroll-area";
import { DataTablePagination } from "./data-table/data-pagination";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/use-socket";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  visibleColumns: VisibilityState;
  tableType: "internship" | "student" | "faculty" | "skill" | "mentee";
  title?: string;
  onRowClick: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tableType,
  title,
  visibleColumns,
  onRowClick
}: DataTableProps<TData, TValue>) {
  const { onChange, type, onSocketClose } = useSocket();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>();
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  // const [pagination, setPagination] = React.useState<PaginationState>({pageSize:5, pageIndex:0});

  React.useEffect(() => {
    setColumnVisibility(visibleColumns);
  }, [visibleColumns]);

  React.useEffect(() => {
    if (tableType == "mentee" && columnVisibility?.select)
      onChange("rows", { rows: rowSelection });
  }, [rowSelection]);

  React.useEffect(() => {
    if (type == "rowSelection") {
      setRowSelection({});
      onSocketClose();
    }
  }, [type]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    // onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      // pagination
    },
  });

  return (
    <div className="space-y-4 bg-white/80 p-3 rounded-lg ">
      <span className="capitalize font-semibold font-sans text-xl">
        {title}
      </span>
      <DataTableToolbar table={table} type={tableType} />
      <ScrollArea
        className={cn(
          "rounded-md  lg:w-[70vw]",
          tableType == "mentee"
            ? "md:h-[40vh] h-[40vh]"
            : "md:h-[60vh] h-[50vh]"
        )}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-slate-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onDoubleClick={()=>onRowClick(row.original)}
                 
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className=" text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      {/* <DataTablePagination table={table} /> */}
    </div>
  );
}
