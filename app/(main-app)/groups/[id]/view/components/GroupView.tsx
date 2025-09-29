"use client";

import React, { Suspense } from "react";
import CardWrapper from "@/app/(main-app)/components/Cards";
import { Members } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";


type GroupProps = {
  id: string;
  name: string;
  active: boolean | null;
  created_by: string;
  creator_username: string | null;
  creator_email: string | null;
};

function GroupView({
  group,
  members,
  userId,
  children,
}: {
  group: GroupProps;
  members: Members;
  userId: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className={`mb-4 text-xl md:text-2xl`}>{group.name}</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<Skeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6">{children}</div>
    </div>
  );
}

export default GroupView;
