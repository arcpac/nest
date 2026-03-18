"use client";

import { DeleteExpensesPayload, useModalStore } from "@/app/stores/ModalProvider";
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

const DeleteExpensesModal = () => {
    const router = useRouter();

    const { isOpen, type, data, close } = useModalStore(
        useShallow((s) => ({
            isOpen: s.isOpen,
            type: s.type,
            data: s.data,
            close: s.close
        }))
    );

    const [deleting, setIsDeleting] = useState<boolean>(false);
    const open = isOpen && type === "delete-expenses";
    const { execute: handleDeleteExpense } = useAction(deleteExpense, {
        onSuccess: ({ data }) => {
            debugger;
            setIsDeleting(false);
            if (data?.isSuccess) {
                close();
                router.refresh();
            }
        },
        onError: () => {
            setIsDeleting(false);
        },
    });
    if (!open) return null

    const handleDelete = () => {
        if (deleting) return;
        const expenseIds = (data as DeleteExpensesPayload | undefined)?.expenseIds;
        if (!expenseIds?.length) return;
        setIsDeleting(true);
        handleDeleteExpense({ expenseIds });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && close()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete expenses</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the selected expenses?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={close} type="button" disabled={deleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" type="button" onClick={handleDelete} disabled={deleting}>
                        {deleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteExpensesModal;
