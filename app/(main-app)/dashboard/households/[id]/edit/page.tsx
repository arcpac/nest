import { Input } from "@/components/ui/input";
import React from "react";
import { getHouseholdId, getHouseholdMembers } from "../../../lib/houseHold";
import { RadioGroup } from "@/components/ui/radio-group";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [household, members] = await Promise.all([
    getHouseholdId(id),
    getHouseholdMembers(id),
  ]);
  return (
    <>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Household Name
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <Input
                id="name"
                placeholder="e.g. My Apartment"
                value={household.name}
                className="bg-white"
                // onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Status
        </label>
        <div className="rounded-[8px] border border-gray-200 bg-white px-[14px] py-3">
          {/* <RadioGroup
            defaultValue="comfortable"
            className="flex gap-4"
            value={household.status}
            // onValueChange={setHouseStatus}
          >
            <div className="flex items-center">
              <RadioGroupItem
                value="default"
                id="r1"
                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
              />
              <Label
                htmlFor="r1"
                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
              >
                Inactive
              </Label>
            </div>
            <div className="flex items-center">
              <RadioGroupItem
                value="comfortable"
                id="r2"
                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
              />
              <Label
                htmlFor="r2"
                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
              >
                Active
              </Label>
            </div>
          </RadioGroup> */}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button
     
        >
          Update household
        </Button>
      </div>
    </>
  );
}
