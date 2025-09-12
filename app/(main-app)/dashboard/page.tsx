import { getServerSession } from "next-auth";
import HouseHoldList from "./components/HouseHoldList";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { Suspense } from "react";
import CreateHousehold from "./components/CreateHousehold";
import { HouseholdListSkeleton } from "@/app/ui/Skeletons";
import { cn } from "@/lib/utils";
import { inter, lusitana } from "@/app/ui/fonts";
import Link from "next/link";
import CardWrapper from "./components/Cards";
import ExpensesChart from "./components/ExpensesChart";
import {
  CardSkeleton,
  InvoiceSkeleton,
  RevenueChartSkeleton,
} from "@/components/ui/skeleton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <ExpensesChart />
        </Suspense>
        <Suspense fallback={<InvoiceSkeleton />}>
          <HouseHoldList />
        </Suspense>
        {/* <Suspense fallback={<RevenueChartSkeleton />}>
          <ExpensesChart />
        </Suspense> */}
        {/* <Suspense fallback={<LatestInvoicesSkeleton />}>
          <HouseholdList />
        </Suspense> */}
      </div>
    </main>
  );
}
