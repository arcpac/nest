"use client";

import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
type GroupsProp = {
  id: string;
  name: string;
  active: boolean | null;
  created_by: string;
  created_at: Date;
}[];
function GroupsTable({ groups }: { groups: GroupsProp }) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {groups?.map((group) => (
              <div
                key={group.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{group.name}</p>
                    </div>
                    {/* <p className="text-sm text-gray-500">{invoice.email}</p> */}
                  </div>
                  {/* <InvoiceStatus status={invoice.status} /> */}
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {/* {formatCurrency(invoice.amount)} */} 123
                    </p>
                    <p>123</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    {/* <Link
                      href={`/dashboard/households/${group.id}/edit`}
                      className="rounded-md border p-2 hover:bg-gray-100"
                    >
                      <PencilIcon className="w-5" /> test
                    </Link> */}
                    <Trash />
                    {/* <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} /> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Customer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {groups?.map((group) => (
                <tr
                  key={group.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {/* <Image
                        src={invoice.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${invoice.name}'s profile picture`}
                      /> */}
                      <Link href={`/groups/${group.id}/view`}>
                        <span className="hover: text-blue-500 hover:underline">
                          {group.name}
                        </span>
                      </Link>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {/* {invoice.email} */}
                    enail@email.com
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {/* {formatCurrency(invoice.amount)} */}123
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {/* {formatDateToLocal(invoice.date)} */}123
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {group.active ? (
                      <Label
                        htmlFor="r2"
                        className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        Active
                      </Label>
                    ) : (
                      <Label
                        htmlFor="r1"
                        className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                      >
                        Inactive
                      </Label>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GroupsTable;
