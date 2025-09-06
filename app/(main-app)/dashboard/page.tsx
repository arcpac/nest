import { getServerSession } from "next-auth";
import HouseHoldList from "./components/HouseHoldList";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { Suspense } from "react";
import CreateHousehold from "./components/CreateHousehold";
import { HouseholdListSkeleton } from "@/app/ui/Skeletons";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  console.log("session", session);
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex-1 p-6 container mx-auto">
      <div className="flex flex-row justify-start items-center mb-3">
        <h1 className="text-2xl font-bold text-neutral-500">Households </h1>
        <div className="text-md m-4 rounded-full text-neutral-500">
          {/* {households.length} */} 44
        </div>
      </div>
      <div className="rounded-xl border p-4 transition bg-white my-2">
        <CreateHousehold />
      </div>
      <Suspense fallback={<HouseholdListSkeleton />}>
        <HouseHoldList />
      </Suspense>
    </div>
  );
}
