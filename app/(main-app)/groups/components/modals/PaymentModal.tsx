"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { useState, useEffect } from 'react'
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
import { Label } from "@/components/ui/label";
import { PayExpensePayload, useModalStore } from "@/app/stores/ModalProvider";

type PaymentType = "full" | "partial";

const STEP = 0.5;

function toNumber(v: number | string) {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

function round2(n: number) {
    return Math.round(n * 100) / 100;
}

export default function PaymentModal() {
    const { isOpen, type, data, close } = useModalStore(
        useShallow((s) => ({
            isOpen: s.isOpen,
            type: s.type,
            data: s.data as PayExpensePayload | undefined,
            close: s.close,
        }))
    );

    const open = isOpen && type === "pay-expense";
    const expense = data?.expense;

    const totalShare = toNumber(expense?.shareAmount ?? 0);

    const [paymentType, setPaymentType] = useState<PaymentType>("full");
    const [partialAmount, setPartialAmount] = useState<string>("0.00");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setPaymentType("full");
        setPartialAmount("0.00");
        setIsSubmitting(false);
    }, [open, expense?.expenseId]);

    const currentPartialAmount = clamp(toNumber(partialAmount), 0, totalShare);

    const handlePartialAmountChange = (delta: number) => {
        const next = round2(clamp(currentPartialAmount + delta, 0, totalShare));
        setPartialAmount(next.toFixed(2));
    };

    const setPartialPercent = (pct: number) => {
        const next = round2(clamp(totalShare * pct, 0, totalShare));
        setPartialAmount(next.toFixed(2));
    };

    const payAmount =
        paymentType === "full" ? round2(totalShare) : round2(currentPartialAmount);

    const remaining =
        paymentType === "partial" ? round2(totalShare - currentPartialAmount) : 0;

    const canSubmit =
        !!expense?.expenseId &&
        !isSubmitting &&
        (paymentType === "full" ? totalShare > 0 : currentPartialAmount > 0);

    const handlePaymentSubmit = async () => {
        if (!expense?.expenseId) return;

    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && close()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Payment Details {paymentType}</DialogTitle>
                    <DialogDescription>
                        Make a payment for{" "}
                        <span className="font-medium">
                            {expense?.expenseTitle ?? "this expense"}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Payment Type Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Payment Type</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={paymentType === "full" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPaymentType("full")}
                                className="flex-1"
                                type="button"
                            >
                                Pay Full Amount
                            </Button>

                            <Button
                                variant={paymentType === "partial" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPaymentType("partial")}
                                className="flex-1"
                                type="button"
                            >
                                Pay Partial Amount
                            </Button>
                        </div>
                    </div>

                    {/* Partial Amount Controls */}
                    {paymentType === "partial" && (
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Amount to Pay</Label>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePartialAmountChange(-STEP)}
                                    disabled={currentPartialAmount <= 0}
                                    type="button"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>

                                <div className="flex-1 text-center">
                                    <span className="text-2xl font-semibold">
                                        ${currentPartialAmount.toFixed(2)}
                                    </span>
                                    <div className="text-xs text-muted-foreground">
                                        Max: ${totalShare.toFixed(2)}
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePartialAmountChange(STEP)}
                                    disabled={currentPartialAmount >= totalShare}
                                    type="button"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Quick amount buttons */}
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPartialPercent(0.25)}
                                    className="flex-1"
                                    type="button"
                                >
                                    25%
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPartialPercent(0.5)}
                                    className="flex-1"
                                    type="button"
                                >
                                    50%
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPartialPercent(0.75)}
                                    className="flex-1"
                                    type="button"
                                >
                                    75%
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Payment Summary */}
                    <div className="rounded-lg bg-muted p-3">
                        <div className="flex justify-between text-sm">
                            <span>Total Share:</span>
                            <span className="font-medium">${totalShare.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Amount to Pay:</span>
                            <span className="font-medium">${payAmount.toFixed(2)}</span>
                        </div>

                        {paymentType === "partial" && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Remaining:</span>
                                <span>${remaining.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={close} type="button">
                        Cancel
                    </Button>

                    <Button onClick={handlePaymentSubmit} disabled={!canSubmit} type="button">
                        {isSubmitting
                            ? "Processing..."
                            : paymentType === "full"
                                ? "Pay Full Amount"
                                : `Pay $${currentPartialAmount.toFixed(2)}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
