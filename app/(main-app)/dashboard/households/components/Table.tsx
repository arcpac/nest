import { Pencil, Trash } from "lucide-react";
import Image from "next/image";
import { getAllHouseholds } from "../../lib/houseHold";
import Link from "next/link";

export default async function HouseHoldTable() {
  //   const invoices = await fetchFilteredInvoices(query, currentPage);

  const households = await getAllHouseholds();

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {households?.map((hh) => (
              <div key={hh.id} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      {/* <Image
                        src={invoice.image_url}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${invoice.name}'s profile picture`}
                      /> */}
                      <p>{hh.name}</p>
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
                      href={`/dashboard/households/${hh.id}/edit`}
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
              {households?.map((hh) => (
                <tr
                  key={hh.id}
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
                      <p>{hh.name}</p>
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
                    {/* <InvoiceStatus status={hh.status} /> */}status
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/dashboard/households/${hh.id}/edit`}
                        className="inline-flex items-center p-2 rounded hover:bg-gray-100"
                      >
                        <Pencil className="w-5 h-5 text-gray-600" />
                      </Link>
                      <Trash />
                      {/* <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice id={invoice.id} /> */}
                    </div>
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
