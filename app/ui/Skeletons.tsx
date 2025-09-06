import { Skeleton } from "@/components/ui/skeleton";

export const HouseholdListSkeleton = () => {
  return (
    <div>
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="rounded-xl border p-4 bg-white">
            <div className="flex flex-col space-y-2">
              {/* Title */}
              <Skeleton className="h-5 w-40 rounded-md" />

              {/* Subtitle */}
              <Skeleton className="h-4 w-28 rounded-md" />

              {/* Status */}
              <div className="mt-2 inline-flex items-center space-x-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
