"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHousehold } from "./actions/household";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import Link from "next/link";
import { CheckIcon, ClockIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function HouseHoldForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [houseStatus, setHouseStatus] = useState("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { execute: addHousehold } = useAction(createHousehold, {
    onSuccess: async ({ data }) => {
      if (data.success) {
        toast.success(`Household created successfuly`);
      }

      if (data.error) {
        toast.error(`${data.message}`);
      }
      setIsSubmitting(false);
    },
    onExecute: () => {
      setIsSubmitting(true);
    },
  });

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
                value={name}
                className="bg-white"
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
            value={houseStatus}
            onValueChange={setHouseStatus}
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
        <Button
          onClick={() => {
            if (!name.trim()) {
              toast.error("Name is required");
            }
            addHousehold({ name });
          }}
        >
          Create
        </Button>
      </div>
    </>
  );
}
