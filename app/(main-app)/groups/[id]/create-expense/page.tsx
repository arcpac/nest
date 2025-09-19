import React from "react";
import { getGroupWithMembers } from "@/app/(main-app)/dashboard/lib/groups";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CreateExpenseForm from "./components/CreateExpenseForm";

export default async function CreateExpensePage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  const params = await props.params;
  const groupId = params.id;
  
  const result = await getGroupWithMembers(groupId);
  if (!result) {
    redirect("/groups");
  }
  
  const { group, members } = result;

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        {/* Sidebar can be added here if needed */}
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Create Expense for {group.name}</h1>
          <CreateExpenseForm groupId={groupId} members={members} />
        </div>
      </div>
    </div>
  );
}
