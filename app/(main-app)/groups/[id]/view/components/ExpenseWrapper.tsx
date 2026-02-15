import { Members } from "@/app/types";
import ExpenseList from "./ExpenseList";
import { getGroupExpenses } from "@/app/(main-app)/actions/groups";
import { Suspense } from "react";
import { TableSkeleton } from "@/app/(main-app)/components/Skeletons";

export default async function ExpenseWrapper({
  groupId,
  userId,
  members,
  page,
  pageSize
}: {
  groupId: string;
  userId: string;
  members: Members;
  page: number
  pageSize: number
}) {
  const { expenses, totalCount } = await getGroupExpenses(groupId, userId, {
    page,
    pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Suspense fallback={<TableSkeleton />}>
      <div className="col-span-4">
        <ExpenseList expenses={expenses} members={members} groupId={groupId} page={page} totalPages={totalPages} />
      </div>
    </Suspense>
  );
}
