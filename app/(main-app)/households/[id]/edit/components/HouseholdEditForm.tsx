"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import React, { useState } from "react";

interface HouseholdProps {
  id: string;
  name: string;
  active: boolean;
}

const HouseholdEditForm = ({ household }: { household: HouseholdProps }) => {
  const [name, setName] = useState(household.name);
  const [active, setActive] = useState(household.active);
  return (
    <div>
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
                // defaultValue={household.name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Status
        </label>
        <div className="rounded-[8px] border border-gray-200 bg-white px-[14px] py-3">
          <RadioGroup
            defaultValue="comfortable"
            className="flex gap-4"
            value={household.active ? "active" : "inactive"}
            onValueChange={(val) => setActive(val === "active" ? true : false)}
          >
            <div className="flex items-center">
              <RadioGroupItem
                value="inactive"
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
                value="active"
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
          </RadioGroup>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button>Update household</Button>
      </div>
    </div>
  );
};

export default HouseholdEditForm;
