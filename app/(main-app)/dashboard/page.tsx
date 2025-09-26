import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { Suspense } from "react";
import { lusitana } from "@/app/ui/fonts";
import { Skeleton } from "@/components/ui/skeleton";


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main>
      {/* <DataProvider initialCount={9} initialTotalDebt={20.99}> */}
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<Skeleton />}>
          {/* <CardWrapper /> */}card
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<Skeleton />}>
          {/* <ExpensesChart /> */}
        </Suspense>
        <Suspense fallback={<Skeleton />}>
          {/* <HouseHoldList /> */} List
        </Suspense>
      </div>
      {/* </DataProvider> */}
    </main>
  );
}
