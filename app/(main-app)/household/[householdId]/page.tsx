
import HouseHoldWrapper from "./components/HouseHoldWrapper";
import { Suspense } from "react";

type Params = {
  params: { householdId: string };
};

export default async function HouseholdDetailPage({ params }: Params) {
  const houseHoldId = params.householdId;

  if (!houseHoldId) {
    return <div>Household not found</div>;
  }

  return (
    <div className="flex-1 p-6 container mx-auto">
      <Suspense fallback={<div>Loading...</div>}>
        <HouseHoldWrapper houseHoldId={houseHoldId} />
      </Suspense>
    </div>
  );
}
