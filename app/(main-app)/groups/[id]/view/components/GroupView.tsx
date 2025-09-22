"use client";

import { lusitana } from "@/app/ui/fonts";
import { CardsSkeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";
import ExpenseList from "./ExpenseList";
import DataProvider from "@/app/DataProvider";
import CardWrapper from "@/app/(main-app)/components/Cards";
import { Expenses } from "@/app/types";

type GroupProps = {
  id: string;
  name: string;
  active: boolean | null;
  created_by: string;
  creator_username: string | null;
  creator_email: string | null;
};

type MembersProps = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  joined_at: Date;
}[];

function GroupView({
  group,
  members,
  expenses,
  totalGroupDebt,
}: {
  group: GroupProps;
  members: MembersProps;
  expenses: Expenses;
  totalGroupDebt: string;
}) {
  const totalActiveExpenses = expenses.length;
  return (
    <DataProvider
      initialCount={9}
      initialExpenseData={{
        totalDebt: totalGroupDebt,
        totalActiveExpenses: totalActiveExpenses,
      }}
    >
      <div>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          {group.name}
        </h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<CardsSkeleton />}>
            <CardWrapper />
          </Suspense>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 ">
          <ExpenseList expenses={expenses} groupId={group.id} />
        </div>
      </div>
    </DataProvider>
  );
}

export default GroupView;
