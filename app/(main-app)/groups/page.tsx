import React, { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

import HouseHoldTable from "./components/GroupsTable";
import { lusitana } from "@/app/ui/fonts";
import Link from "next/link";
import { HouseholdSkeleton } from "./components/HouseholdSkeleton";
import { getUserGroups } from "../dashboard/lib/groups";
import { redirect } from "next/navigation";
import GroupsTable from "./components/GroupsTable";

const GroupsPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  console.log("session", session);
  const groups = await getUserGroups(session.user.id);
  return (
    <div className="w-full">
      <div className="flex flex-row justify-start items-center mb-3">
        <h1
          className={`text-2xl font-bold text-neutral-500 ${lusitana.className}`}
        >
          Your groups{" "}
        </h1>
        <div className="text-sm text-blue-500 m-4 rounded-full ">
          <Link href="/household">Manage households</Link>
        </div>
      </div>
      <Suspense fallback={<HouseholdSkeleton />}>
        <GroupsTable groups={groups} />
      </Suspense>
    </div>
  );
};

export default GroupsPage;
