"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useDataStore } from "@/app/DataProvider";
import CardWrapper from "../../components/Cards";
import { HouseholdSkeleton } from "./HouseholdSkeleton";
import GroupsTable from "./GroupsTable";
import { lusitana } from "@/app/ui/fonts";
import { Skeleton } from "@/components/ui/skeleton";

const GroupsView = () => {
  const groups = useDataStore((state) => state.groups);
  const totalDebt = useDataStore((state) => state.totalDebt);


  return (
    <div className="w-full">
      <div className="flex flex-row justify-start items-center mb-3">
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Your Groups
        </h1>
        <div className="text-sm text-blue-500 m-4 rounded-full ">
          <Link href="/household">Manage households</Link>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<Skeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <Suspense fallback={<HouseholdSkeleton />}>
        <GroupsTable groups={groups} />
      </Suspense>
    </div>
  );
};

export default GroupsView;
