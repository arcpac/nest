import { lusitana } from "@/app/ui/fonts";
import { Banknote, Clock, Group, Inbox } from "lucide-react";

// import { fetchCardData } from "@/app/lib/data";

const iconMap = {
  collected: Banknote,
  debtors: Group,
  pending: Clock,
  invoices: Inbox,
};

export default async function CardWrapper() {
  // const {
  //   numberOfInvoices,
  //   numberOfCustomers,
  //   totalPaidInvoices,
  //   totalPendingInvoices,
  // } = await fetchCardData();
  return (
    <>
      <Card title="Collected" value={1} type="collected" />
      <Card title="Pending" value={123.23} type="pending" />
      <Card title="Total Invoices" value={453.0} type="invoices" />
      <Card title="Total Debtors" value={2} type="debtors" />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: "invoices" | "debtors" | "pending" | "collected";
}) {
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
        {value}
      </p>
    </div>
  );
}
