import { getUserId } from "@/lib/auth";
import DataProvider from "@/app/DataProvider";
import { getUserGroups } from "../actions/groups";

export default async function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getUserId();

  const { userGroups: groups, totalDebt } = await getUserGroups(userId);

  return (
    <DataProvider
      initialCount={9}
      initialGroups={groups}
      initialExpenseData={{ totalDebt: totalDebt, totalActiveExpenses: 0 }}
    >
      {children}
    </DataProvider>
  );
}
