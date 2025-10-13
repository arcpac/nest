"use client";
import { useDataStore } from "@/app/DataProvider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  Banknote,
  Clock,
  Group,
  Inbox,
  TrendingUp,
} from "lucide-react";

// import { fetchCardData } from "@/app/lib/data";

const iconMap = {
  collected: Banknote,
  debtors: Group,
  pending: Clock,
  invoices: Inbox,
};

export default function CardWrapper() {
  const totalDebt = useDataStore((state) => state.totalDebt);
  const totalActiveExpenses = useDataStore(
    (state) => state.totalActiveExpenses
  );

  return (
    <>
      <Card className="w-full max-w-sm p-4">
        <CardHeader className="p-0 flex flex-col">
          <CardDescription>Total Debt</CardDescription>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${totalDebt}
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1"
              >
                +12.5%
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="p-0 mt-2 flex flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>

      {/* Second Card */}
      <Card className="w-full max-w-sm p-4">
        <CardHeader className="p-0 flex flex-col">
          <CardDescription>Total Debt</CardDescription>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${totalDebt}
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1"
              >
                +12.5%
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="p-0 mt-2 flex flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
    </>
  );
}


// export function Card({
//   title,
//   value,
//   type,
// }: {
//   title: string;
//   value: number | string;
//   type: "invoices" | "debtors" | "pending" | "collected";
// }) {
//   const Icon = iconMap[type];

//   return (
//     <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
//       <div className="flex p-4">
//         {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
//         <h3 className="ml-2 text-sm font-medium">{title}</h3>
//       </div>
//       <p
//         className={`${lusitana.className}
//             truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
//       >
//         {value}
//       </p>
//     </div>
//   );
// }
