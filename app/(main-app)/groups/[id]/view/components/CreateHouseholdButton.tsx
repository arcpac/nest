"use client";

import { useTransition } from "react";
import { createHousehold } from "../actions/createHousehold";


export default function CreateHouseholdButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => createHousehold())}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      disabled={isPending}
    >
      {isPending ? "Creating..." : "+ Add Random Household"}
    </button>
  );
}
