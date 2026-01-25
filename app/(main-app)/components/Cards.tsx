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
  const totalActiveExpenses = useDataStore((state) => state.totalActiveExpenses);


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
      <Card className="w-full max-w-sm p-4">
        <CardHeader className="p-0 flex flex-col">
          <CardDescription>Unpaid expense shares total</CardDescription>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${totalDebt}
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1"
              >
                {totalActiveExpenses}
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