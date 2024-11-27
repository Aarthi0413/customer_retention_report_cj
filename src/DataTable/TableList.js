/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ArrowUpDown, ChevronDown, Loader2 } from "lucide-react"
import domo from "ryuu.js";
import { successToast } from 'components/Toaster/Toaster';
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover';
import { MdOutlineWhatsapp } from "react-icons/md";
import { IoMdMail } from "react-icons/io";
import { RiMessage2Line } from "react-icons/ri";
import BulkMailModel from './BulkMailModel';
const TableList = ({ data }) => {


  const columns = [
    {
      accessorKey: "Customer Name",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("Customer Name")}</div>
      ),
    },
    {
      accessorKey: "Last Visit Date",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Visited Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("Last Visit Date")}</div>,
    },
    {
      accessorKey: "Duration since Last Visit",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Duration since Last Visit
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("Duration since Last Visit")}</div>,
    },
    {
      accessorKey: "Is Lost",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Regular/Lost
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => {
        const [singleEmailLoading, setSingleEmailLoading] = useState(false);
        const [singleEmailOpen, setSingleEmailOpen] = useState(false);

        const handleEmailSent = (email) => {
          setSingleEmailLoading(true);

          const customerName = row.getValue("Customer Name")

          const emailSubject = "We Miss You! Here’s a Special 2% Discount Just for You ✨"
          const emailContent = `Dear ${customerName},
We hope this message finds you well! It’s been a while since we last had the pleasure of serving you.

To show you how much we appreciate your past business, we’re excited to offer you an exclusive 2% discount on your next gold purchase with us. It’s our way of saying "Welcome back!"

Warm regards,
Coimbatore Jewellers`;

          const htmlBody = emailContent.split('\n').map(line =>
            line ? `<p style="margin: 0 0 0.2em 0;">${line.trim()}</p>` : '<br>'
          ).join('');

          const data = {
            to: domo.env.userEmail,
            subject: emailSubject,
            body: htmlBody,
          };

          domo.post(`/domo/workflow/v1/models/eig_mail/start`, data)
            .then((response) => {
              setSingleEmailLoading(false);
              if (response) {
                successToast("Email sent to customer");
                setSingleEmailOpen(false); 
              }
            })
            .catch((error) => {
              setSingleEmailLoading(false);
              console.error("Error starting workflow:", error);
            });
        };

        return row.getValue("Is Lost") === 0 ? (
          <div className="bg-green-500 py-1 px-2 w-20 rounded uppercase text-center text-white text-[12px] font-medium">
            Regular
          </div>
        ) : (
          <Popover open={singleEmailOpen} onOpenChange={setSingleEmailOpen}>
            <PopoverTrigger asChild>
              <div
                className="bg-red-500 py-1 px-2 w-20 rounded uppercase text-center text-white text-[12px] font-medium cursor-pointer"
                onClick={() => setSingleEmailOpen(true)}
              >
                Notify
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              <div className="flex gap-4 items-center">
                {singleEmailLoading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <IoMdMail
                    onClick={() => handleEmailSent("aarthi.murugesan@gwcdata.ai")}
                    className="text-2xl text-[#015289] hover:text-blue-500"
                  />
                )}
                <MdOutlineWhatsapp className="text-2xl text-[#015289] hover:text-green-500" />
                <RiMessage2Line className="text-2xl text-[#015289] hover:text-red-500" />
              </div>
            </PopoverContent>
          </Popover>
        );
      },

    },
  ]



  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5, // Limit rows per page to 10
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
  })

  const totalPages = table.getPageCount();

  return (
    <div className="w-full">

      <div className="flex justify-between md:items-center py-4 md:flex-row flex-col">
        <div className='flex items-center'>
          <Input
            placeholder="Search..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) =>
              table.setGlobalFilter(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='md:mt-0 mt-2'>
          {data.length > 0 && <BulkMailModel data={data} />}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-black">
          <div>
            Record count : {" "}
            <span className="font-bold">{table.getFilteredRowModel().rows.length}</span>
          </div>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TableList;