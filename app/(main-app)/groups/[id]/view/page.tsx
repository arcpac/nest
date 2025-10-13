import React, { Suspense } from "react";
import { getGroupWithMembers } from "@/app/(main-app)/actions/groups";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import ExpenseWrapper from "./components/ExpenseWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import CardWrapper from "@/app/(main-app)/components/Cards";
import { TableSkeleton } from "@/app/(main-app)/components/Skeletons";

export default async function ViewPage(props: {
  params: Promise<{ id: string; query?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await props.params;
  const result = await getGroupWithMembers(id);

  if (!result) return <></>;
  const { group, members } = result;
  return (
    <div>
      <h1 className={`mb-4 text-xl md:text-2xl`}>{group.name}</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<Skeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6">
        <Suspense fallback={<TableSkeleton />}>
          <ExpenseWrapper
            groupId={group.id}
            userId={session.user.id}
            members={members}
          />
        </Suspense>
      </div>
    </div>
  );
}
