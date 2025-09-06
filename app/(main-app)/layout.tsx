import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MainNavBar from "./components/MainNavBar";
import { inter, lusitana } from "../ui/fonts";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div
      className={`main-app-layout flex flex-col min-h-screen bg-[#f7f9ff] ${inter.className}`}
    >
      <MainNavBar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
