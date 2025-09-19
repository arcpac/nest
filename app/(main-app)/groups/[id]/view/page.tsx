import React, { Suspense } from "react";
import {
  getGroupExpenses,
  getGroupWithMembers,
} from "@/app/(main-app)/dashboard/lib/groups";
import { lusitana } from "@/app/ui/fonts";
import { CardsSkeleton, RevenueChartSkeleton } from "@/components/ui/skeleton";
import CardWrapper from "./components/Cards";
import ExpensesChart from "./components/ExpensesChart";
import ExpenseList from "./components/ExpenseList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ViewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const params = await props.params;
  const id = params.id;
  const result = await getGroupWithMembers(id);
  if (!result) return <></>;
  const { group, members } = result;
  const { expenses } = await getGroupExpenses(
    group.id,
    session.user.id
  );
  console.log("expenses", expenses);
  console.log("expenseShare", expenseShare);
  return (
    <div>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Group view page
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 ">
        <ExpenseList expenses={expenses} />
        {/* <Suspense fallback={<RevenueChartSkeleton />}>
          <ExpensesChart />
        </Suspense> */}
      </div>
    </div>
  );
}
