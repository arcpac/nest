import { inter } from "../ui/fonts";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import DataProvider from "../DataProvider";
import { getUserId } from "@/lib/auth";
import { getTotalUnpaidShares, getUserGroups } from "./actions/groups";


export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getUserId();

  const [userGroups, { totalDebt, unpaidCount }] = await Promise.all([
    getUserGroups(userId),
    getTotalUnpaidShares(userId),
  ]);


  return (
    <div className={`main-app-layout flex h-screen ${inter.className}`}>
      <SidebarProvider>
        <AppSidebar />
        <DataProvider
          initialCount={9}
          initialGroups={userGroups}
          initialExpenseData={{ totalDebt: totalDebt, totalActiveExpenses: unpaidCount }}
        >
          <main className="flex-1 flex flex-col">
            <div className="flex-1 p-6">{children}</div>
          </main>
        </DataProvider>
      </SidebarProvider>
    </div>
  );
}
