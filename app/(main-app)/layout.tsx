import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { inter, lusitana } from "../ui/fonts";
import SideNav from "./components/Sidenav";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div
      className={`main-app-layout flex h-screen flex-col md:flex-row md:overflow-hidden ${inter.className}`}
    >
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <main className="flex-1">
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
