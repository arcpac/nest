import { cn } from "@/lib/utils";
import { CheckIcon, ClockIcon } from "lucide-react";

function StatusLabel({ isTrue }: { isTrue: boolean }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs", {
        "bg-gray-100 text-gray-500": !isTrue,
        "bg-green-500 text-white": isTrue,
      })}
    >
      {!isTrue ? (
        <>
          Pending
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {isTrue ? (
        <>
          Paid
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </span>
  );
}

export default StatusLabel;
