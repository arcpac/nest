import React, { Suspense } from "react";
import { getGroupWithMembers } from "@/app/(main-app)/actions/groups";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import GroupView from "./components/GroupView";

import ExpenseWrapper from "./components/ExpenseWrapper";

export default async function ViewPage(props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const { id } = await props.params;
  const result = await getGroupWithMembers(id);
  if (!result) return <></>;
  const { group, members } = result;
  return (
    <GroupView group={group} members={members} userId={session.user.id}>
      <Suspense fallback={<>Loading</>}>
        <ExpenseWrapper
          groupId={group.id}
          userId={session.user.id}
          members={members}
        />
      </Suspense>
    </GroupView>
  );
}
