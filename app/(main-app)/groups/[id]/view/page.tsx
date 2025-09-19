import React from "react";
import {
  getGroupExpenses,
  getGroupWithMembers,
} from "@/app/(main-app)/dashboard/lib/groups";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import GroupView from "./components/GroupView";

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
  const { expenses, totalGroupDebt } = await getGroupExpenses(
    group.id,
    session.user.id
  );

  return (
    <GroupView
      group={group}
      expenses={expenses}
      members={members}
      totalGroupDebt={totalGroupDebt}
    />
  );
}
