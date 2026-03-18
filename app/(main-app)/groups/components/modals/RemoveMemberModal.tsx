"use client";

import { DeleteExpensesPayload, RemoveMemberPayload, useModalStore } from "@/app/stores/ModalProvider";
import React, { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { deleteExpense } from "@/app/(main-app)/actions/deleteExpense";
import { useRouter } from "next/navigation";
import { removeMember } from "@/lib/server/removeMember";
import { toast } from "sonner";

const RemoveMemberModal = () => {
    const router = useRouter();
    const [removingMember, setRemovingMember] = useState<boolean>(false)

    const { isOpen, type, data, close } = useModalStore(
        useShallow((s) => ({
            isOpen: s.isOpen,
            type: s.type,
            data: s.data,
            close: s.close
        }))
    );
    const { groupId, userId } = data as RemoveMemberPayload

    const open = isOpen && type === "remove-member";
    const { execute: removeMemberHandler } = useAction(removeMember, {
        onExecute: () => {
            setRemovingMember(true)
        },
        onSuccess: ({ data }) => {

            setRemovingMember(false);
            if (data?.isSuccess) {
                toast.success(data.message ?? "Member removed.", { id: "remove-member" });
                close();
                router.refresh();
                return;
            }

            toast.error(data?.message ?? "Unable to remove member.", { id: "remove-member" });
        },
        onError: () => {
            setRemovingMember(false);
            toast.error("Something went wrong. Please try again.", { id: "remove-member" });
        },
    });
    if (!open) return null
    return (
        <Dialog open={open} onOpenChange={(v) => !v && close()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Remove Member</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove Name?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={close} type="button" disabled={removingMember}>
                        Cancel
                    </Button>
                    <Button variant="destructive" type="button" onClick={() => removeMemberHandler({ groupId, userId })} disabled={removingMember}>
                        {removingMember ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default RemoveMemberModal;
