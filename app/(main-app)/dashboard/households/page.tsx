import React, { Suspense } from "react";
import HouseHoldTable from "./components/Table";
import { lusitana } from "@/app/ui/fonts";
import Link from "next/link";
import { HouseholdSkeleton } from "./components/HouseholdSkeleton";

const HouseholdPage = () => {
  return (
    <div className="w-full">
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
      {/* <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
      <Search placeholder="Search invoices..." />
      <CreateInvoice />
    </div> */}
      <Suspense fallback={<HouseholdSkeleton />}>
        <HouseHoldTable />
      </Suspense>
      
      {/* <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div> */}
    </div>
  );
};

export default HouseholdPage;
