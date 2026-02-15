import React, { Suspense } from "react";
import { getGroupWithMembersCached } from "@/app/(main-app)/actions/groups";
import { notFound } from "next/navigation";
import ExpenseWrapper from "./components/ExpenseWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import CardWrapper from "@/app/(main-app)/components/Cards";
import { getUser, requireGroupMember } from "@/lib/auth";
import GroupMemberList from "./components/GroupMemberList";

const PAGE_SIZE = 20;

export default async function ViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: number }>
}) {

  const [user, { id }, sp] = await Promise.all([
    getUser(),
    params,
    searchParams ?? Promise.resolve({}),
  ]);

  const page = Math.max(1, Number(sp.page ?? 1));

  const ok = await requireGroupMember(user.id, id);
  if (!ok) notFound();
  const result = await getGroupWithMembersCached(id);
  if (!result) notFound();
  const { group, members } = result;

  return (
    <div>
      <h1 className={`mb-4 text-xl md:text-2xl`}>{group.name}</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardWrapper />
      </div>
      <div className="mt-6 grid grid-cols-6 gap-6">
        <ExpenseWrapper
          groupId={group.id}
          userId={user.id}
          members={members}
          page={page}
          pageSize={5}
        />
        <div className="col-span-2">
          <GroupMemberList groupId={group.id} groupMembers={members} />
        </div>

      </div>
    </div>
  );
}
