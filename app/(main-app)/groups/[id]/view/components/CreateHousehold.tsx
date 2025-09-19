"use client";
import Link from "next/link";

export default function CreateHousehold() {
  return (

      <Link href="/household">
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-center font-semibold text-gray-600">
            + Add new household
          </div>
          {/* <div className="text-sm text-gray-400">Editable name</div> */}
        </div>
      </Link>

  );
}
