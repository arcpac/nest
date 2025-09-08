import { getServerSession } from "next-auth";
import HouseHoldList from "./components/HouseHoldList";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { Suspense } from "react";
import CreateHousehold from "./components/CreateHousehold";
import { HouseholdListSkeleton } from "@/app/ui/Skeletons";
import { cn } from "@/lib/utils";
import { inter, lusitana } from "@/app/ui/fonts";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    // <div className="flex-1 p-6 container">
    <>
      <div className="flex flex-row justify-start items-center mb-3">
        <h1
          className={`text-2xl font-bold text-neutral-500 ${lusitana.className}`}
        >
          Households{" "}
        </h1>
        <div className="text-sm text-blue-500 m-4 rounded-full ">
          {/* {households.length} */}
          <Link href="/household">Manage households</Link>
        </div>
      </div>
      <div className="rounded-xl border p-4 transition bg-white my-2">
        <CreateHousehold />
      </div>
      <Suspense fallback={<HouseholdListSkeleton />}>
        <HouseHoldList />
      </Suspense>
    </>
    // </div>
  );
}
