import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DataProvider from "@/app/DataProvider";
import { getUserGroups } from "../actions/groups";

export default async function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { userGroups: groups, totalDebt } = await getUserGroups(
    session.user.id
  );
  // TODO: continue to optimise layout

  return (
    <DataProvider
      initialCount={9}
      initialGroups={groups}
      initialExpenseData={{ totalDebt: totalDebt, totalActiveExpenses: 0 }}
    >
      <div>{children}</div>
    </DataProvider>
  );
}
