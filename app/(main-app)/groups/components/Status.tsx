import { cn } from "@/lib/utils"; // adjust to your cn helper
import { Badge } from "@/components/ui/badge";
import { Check, Loader } from "lucide-react"; // or wherever your Loader is from

type StatusLabelProps = {
  isTrue: boolean;
  type: "groups" | "expenses";
};
//  variant="secondary"
//           className="bg-blue-500 text-white dark:bg-blue-600"
export function StatusLabel({ isTrue, type }: StatusLabelProps) {
  // map statuses by type
  const statusMap = {
    groups: {
      true: { label: "Active", variant: "default" as const },
      false: { label: "Inactive", variant: "secondary" as const },
    },
    expenses: {
      true: { label: "Paid", variant: "default" as const },
      false: { label: "Unpaid", variant: "outline" as const },
    },
  };

  const status = statusMap[type][isTrue ? "true" : "false"];

  return (
    <Badge
      variant={status.variant}
      className={cn(
        "inline-flex items-center gap-1",
        isTrue && "bg-blue-500 text-white dark:bg-blue-600"
      )}
    >
      {isTrue ? (
        <Check className="h-3 w-3" />
      ) : (
        <Loader className="h-3 w-3 animate-spin" />
      )}
      {status.label}
    </Badge>
  );
}
