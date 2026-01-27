"use client"

import React, { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PayExpensePayload, useModalStore } from "@/app/stores/ModalProvider";
import { useAction } from "next-safe-action/hooks";
import { payExpense } from "@/app/(main-app)/actions/payExpense";
import { useRouter } from "next/navigation";

const PayExpenseModal = () => {
    const router = useRouter();
    const { isOpen, type, data, close } = useModalStore(
        useShallow((s) => ({
            isOpen: s.isOpen,
            type: s.type,
            data: s.data as PayExpensePayload | undefined,
            close: s.close,
        }))
    );

    const open = isOpen && type === "pay-expense";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedExpenseIds = useMemo(() => {
        if (data?.selectedExpenses instanceof Set) {
            return Array.from(data.selectedExpenses);
        }
        if (Array.isArray(data?.selectedExpenses)) {
            return data.selectedExpenses;
        }
        if (data?.expense?.expenseId) {
            return [data.expense.expenseId];
        }
        return [];
    }, [data]);

    useEffect(() => {
        if (!open) return;
        setIsSubmitting(false);
        setError(null);
    }, [open, selectedExpenseIds.length]);

    const { execute: payExpenseAction } = useAction(payExpense, {
        onSuccess: ({ data }) => {
            setIsSubmitting(false);
            if (data?.isSuccess) {
                close();
                router.refresh();
                return;
            }
            setError(data?.message ?? "Failed to pay expenses");
        },
        onError: () => {
            setIsSubmitting(false);
            setError("Failed to pay expenses");
        },
    });

    const canSubmit = selectedExpenseIds.length > 0 && !isSubmitting;

    const handlePayExpenses = () => {
        if (!canSubmit) return;
        setIsSubmitting(true);
        setError(null);
        payExpenseAction({ expenseIds: selectedExpenseIds });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && close()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Pay expenses</DialogTitle>
                    <DialogDescription>
                        Mark your share as paid for the selected expenses.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error ? (
                        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}
                    <div className="rounded-lg bg-muted p-3 text-sm">
                        <div className="flex justify-between">
                            <span>Selected expenses</span>
                            <span className="font-medium">{selectedExpenseIds.length}</span>
                        </div>
                        {data?.expense?.expenseTitle ? (
                            <div className="mt-1 text-xs text-muted-foreground">
                                {data.expense.expenseTitle}
                            </div>
                        ) : null}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={close} type="button" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handlePayExpenses} disabled={!canSubmit} type="button">
                        {isSubmitting ? "Processing..." : "Confirm Payment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PayExpenseModal;
