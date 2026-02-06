import { inter } from "../ui/fonts";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import DataProvider from "../DataProvider";
import { getUser, getUserProfile } from "@/lib/auth";
import { getTotalUnpaidShares, getUserGroups } from "./actions/groups";


export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user, profile } = await getUserProfile();

  const [userGroups] = await Promise.all([
    getUserGroups(user.id),
    // getTotalUnpaidShares(user.id),
  ]);
  const totalDebt = "12"
  const unpaidCount = 12
  const initialSessionUser = {
    id: user.id,
    name: profile.username ?? null,
    email: user.email,
  };
  return (
    <div className={`main-app-layout flex h-screen ${inter.className}`}>
      <SidebarProvider>
        <DataProvider
          initialCount={9}
          initialGroups={userGroups}
          initialExpenseData={{ totalDebt: totalDebt, totalActiveExpenses: unpaidCount }}
          initialSessionUser={initialSessionUser}
        >
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <div className="flex-1 p-6">{children}</div>
          </main>
        </DataProvider>
      </SidebarProvider>
    </div>
  );
}
