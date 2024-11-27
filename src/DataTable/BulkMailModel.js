import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from 'components/ui/button';
import {
  flexRender,
  getCoreRowModel,
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
} from "../components/ui/table";
import { ArrowUpDown, Loader2 } from "lucide-react"
import domo from "ryuu.js";
import { successToast } from 'components/Toaster/Toaster';

const BulkMailModel = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bulkMail, setBulkMail] = useState([]);

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
      accessorKey: "Email",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("Email")}</div>,
    },
  ]



  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 3, // Limit rows per page to 10
  });

  const table = useReactTable({
    data: bulkMail || [],
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

  useEffect(() => {
    const notifyMail = (data || []).filter((item) => item['Is Lost'] === 0);
    setBulkMail(notifyMail);
  }, [data]);

  // const handleBulkMail = () => {
  //   const notifyMail = (data || []).filter((item) => item['Is Lost?'] === 0); // Safely handle undefined data
  //   setBulkMail(notifyMail);
  // };

  const handleBulkMailSend = () => {

    const emailSubject = "We Miss You! Here’s a Special 2% Discount Just for You ✨"
    const generateEmailContent = (customerName) => `Dear ${customerName},
We hope this message finds you well! It's been a while since we last had the pleasure of serving you.

To show you how much we appreciate your past business, we're excited to offer you an exclusive 2% discount on your next gold purchase with us. It's our way of saying "Welcome back!"

Warm regards,
Coimbatore Jewellers`;

    const htmlBody = (customerName) => generateEmailContent(customerName)
      .split('\n')
      .map(line => line ? `<p style="margin: 0 0 0.2em 0;">${line.trim()}</p>` : '<br>')
      .join('');

    const data = {
      to: domo.env.userEmail,
      subject: emailSubject,
      body: htmlBody(bulkMail[0]['Customer Name']),
    };


    setLoading(true);
    domo.post(`/domo/workflow/v1/models/eig_mail/start`, data)
      .then(response => {
        if (response) {
          successToast("Email was sent to all customers");
        }
      })
      .catch(error => {
        console.error('Error starting workflow:', error);
      }).finally(() => {
        setLoading(false);
        setOpen(false);
      })
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#015289] hover:bg-[#8EABCB]">Bulk Trigger</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Notify Customers</DialogTitle>
          <DialogDescription>You can send mail to all the customers in your area.</DialogDescription>
        </DialogHeader>
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
                    className={row.original.status === "regular" ? "bg-red-200 hover:bg-red-300" : ""}
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
        <div className="flex items-center justify-end space-x-2">
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
        <DialogFooter>
          {
            loading ? (
              <Button type="button" variant="ghost" className='flex items-center mt-5' disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <div>Sending...</div>
              </Button>
            ) : (
              <Button type="submit" onClick={handleBulkMailSend} className="mt-5">Send</Button>
            )
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BulkMailModel;