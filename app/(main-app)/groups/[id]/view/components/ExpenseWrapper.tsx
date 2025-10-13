import { Members } from "@/app/types";
import ExpenseList from "./ExpenseList";
import { getGroupExpenses } from "@/app/(main-app)/actions/groups";

// ExpenseWrapper.tsx
export default async function ExpenseWrapper({
  groupId,
  userId,
  members,
}: {
  groupId: string;
  userId: string;
  members: Members;
}) {
  const { expenses } = await getGroupExpenses(groupId, userId);
  return (
    <>
      <ExpenseList expenses={expenses} members={members} groupId={groupId} />
    </>
  );
}
