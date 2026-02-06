"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditExpensePayload, useModalStore } from "@/app/stores/ModalProvider";
import { useAction } from "next-safe-action/hooks";
import { editExpense } from "@/app/(main-app)/actions/editExpense";
import { useRouter } from "next/navigation";
import SelectField, { MemberOption } from "./SelectField";


export default function EditExpenseModal() {
    const router = useRouter();

    const { isOpen, type, data, close } = useModalStore(
        useShallow((s) => ({
            isOpen: s.isOpen,
            type: s.type,
            data: s.data as EditExpensePayload | undefined,
            close: s.close,
        }))
    );

    const open = isOpen && type === "edit-expense";
    const expense = data?.expense;
    const members = expense?.members;

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<MemberOption[]>([]);
    const [error, setError] = useState<string | null>(null);


    const canSubmit =
        title.trim().length > 0 &&
        Number(amount) > 0 &&
        !isSubmitting &&
        !!expense?.expenseId;

    useEffect(() => {
        if (!open) return;

        setTitle(expense?.expenseTitle ?? "");
        setAmount(expense?.amount ?? "");
        setDescription(expense?.description ?? "");
        setIsSubmitting(false);
        setError(null);
    }, [open, expense?.expenseId]);

    const { execute: editExpenseAction } = useAction(editExpense, {
        onSuccess: ({ data }) => {
            debugger
            setIsSubmitting(false);
            if (data?.isSuccess) {
                close();
                router.refresh();
                return;
            }
            setError(data?.message ?? "Failed to update expense");
        },
        onError: () => {
            debugger;
            setIsSubmitting(false);
        },
    });

    const handleEditExpense = () => {
        if (!expense?.expenseId || isSubmitting) return;
        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
        setIsSubmitting(true);
        setError(null);

        const selectedMemberIds = selectedMembers.length
            ? selectedMembers.map((member) => member.value)
            : undefined;

        editExpenseAction({
            expenseId: expense.expenseId,
            title: title.trim(),
            amount: parsedAmount,
            description: description.trim() ? description.trim() : undefined,
            selectedMemberIds,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && close()}>
            <DialogContent className="rounded">
                <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                    <DialogDescription>Update this expense details.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {error ? (
                        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}
                    <div className="space-y-2">
                        <Label htmlFor="expense-title" className="text-sm font-medium">
                            Title
                        </Label>
                        <Input
                            id="expense-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Dinner at Cafe Roma"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expense-amount" className="text-sm font-medium">
                            Amount
                        </Label>
                        <Input
                            id="expense-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <SelectField
                            members={members}
                            selectedMemberIds={expense?.selectedMemberIds}
                            isOpen={open}
                            selectedMembers={selectedMembers}
                            setSelectedMembers={setSelectedMembers}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expense-description" className="text-sm font-medium">
                            Description
                        </Label>
                        <Input
                            id="expense-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional notes"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={close} type="button">
                        Cancel
                    </Button>
                    <Button onClick={handleEditExpense} disabled={!canSubmit} type="button">
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
