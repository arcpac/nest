"use client";

import React, { Suspense, useState } from "react";
import { useDataStore } from "@/app/DataProvider";
import CardWrapper from "../../components/Cards";
import { HouseholdSkeleton } from "./HouseholdSkeleton";
import GroupsTable from "./GroupsTable";
import { lusitana } from "@/app/ui/fonts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CirclePlus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { createGroup } from "../../actions/createGroup";
import { useRouter } from "next/navigation";

const GroupsView = () => {
  const groups = useDataStore((state) => state.groups);
  const totalDebt = useDataStore((state) => state.totalDebt);

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { execute: createGroupAction } = useAction(createGroup, {
    onSuccess: ({ data }) => {
      debugger
      setIsSubmitting(false);
      if (data?.isSuccess) {
        setOpen(false);
        router.refresh();
      }
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setGroupName("");
      setIsActive(true);
      setIsSubmitting(false);
    }
  };

  const canSubmit = groupName.trim().length > 0 && !isSubmitting;

  const handleCreateGroup = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    createGroupAction({ name: groupName.trim(), active: isActive });
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Your Groups
        </h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" className="gap-2">
              <CirclePlus className="h-4 w-4" />
              Add group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New group</DialogTitle>
              <DialogDescription>
                Create a group and add members later.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group-name" className="text-sm font-medium">
                  Group name
                </Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Beach trip"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="group-active"
                  checked={isActive}
                  onCheckedChange={(value) => setIsActive(value === true)}
                />
                <Label htmlFor="group-active" className="text-sm">
                  Active
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={!canSubmit}
                type="button"
              >
                {isSubmitting ? "Creating..." : "Create group"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<Skeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <Suspense fallback={<HouseholdSkeleton />}>
        <GroupsTable groups={groups} />
      </Suspense>
    </div>
  );
};

export default GroupsView;
