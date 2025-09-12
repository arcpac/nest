"use client";

import { useDataStore } from "@/app/DataProvider";
import { lusitana } from "@/app/ui/fonts";
import { Banknote, Clock, Group, Inbox } from "lucide-react";

const iconMap = {
  collected: Banknote,
  debtors: Group,
  pending: Clock,
  invoices: Inbox,
};

function CardTest({
  title,
  type,
}: {
  title: string;
  type: "invoices" | "debtors" | "pending" | "collected";
}) {
  const storeCount = useDataStore((state) => state.count);
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
              truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {storeCount}
      </p>
    </div>
  );
}

export default CardTest;
