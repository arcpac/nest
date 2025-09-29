
import { inter } from "../ui/fonts";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className={`main-app-layout flex h-screen ${inter.className}`}>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-6">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
