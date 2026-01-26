import { Members } from "@/app/types";
import ExpenseList from "./ExpenseList";
import { getGroupExpenses } from "@/app/(main-app)/actions/groups";

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
  console.log('getgroup expense: ', userId)
  return (
    <div className="col-span-4">
      <ExpenseList expenses={expenses} members={members} groupId={groupId} />
    </div>
  );
}
