import { Skeleton } from "@/components/ui/skeleton";

// Loading animation
const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-gray-200" />
        <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <div className="flex flex-row justify-between">
        <h2 className={`mb-4 text-xl md:text-2xl`}>Expenses</h2>
        <div className="flex text-sm text-blue-500 m-4 rounded-full border gap-3">
          <div className="cursor-pointer">Pay all</div>
          <div>
            <Skeleton className="h-4" />
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="bg-white rounded-lg">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] md:min-w-0">
              <thead className="border-b">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    <Skeleton className="h-12 w-12 rounded-sm" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Skeleton className="h-4" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Skeleton className="h-4" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    <Skeleton className="h-4" />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Skeleton className="h-4" />{" "}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    <Skeleton className="h-4" />{" "}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    <Skeleton className="h-4" />{" "}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-blue-50">
                  {/* checkbox */}
                  <td className="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
                    <Skeleton className="h-12 w-12 rounded-sm" />
                  </td>
                  {/* date */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                    <Skeleton className="h-4 w-full" />
                  </td>
                  {/* expense title */}
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </td>
                  {/* payer */}
                  <td className="px-6 py-3 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right hidden sm:table-cell">
                    <Skeleton className="h-4 w-full" />
                  </td>
                  <td className="whitespace-nowrap py-3 pr-3 hidden sm:table-cell">
                    <div className="flex justify-end gap-3">
                      <div className="inline-flex items-center p-2 rounded hover:bg-gray-100"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExpensesSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-100 p-4">
        <div className="bg-white px-6">
          <TableSkeleton />
          <TableSkeleton />
          <TableSkeleton />
          <TableSkeleton />
          <TableSkeleton />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <ExpensesSkeleton />
      </div>
    </>
  );
}
