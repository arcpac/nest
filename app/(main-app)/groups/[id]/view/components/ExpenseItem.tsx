"use client";

import React, { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckIcon,
  ClockIcon,
  HandCoins,
  Pencil,
  Trash,
  Plus,
  Minus,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Expense, Members } from "@/app/types";
import { StatusLabel } from "../../../components/Status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ExpenseItem = ({
  expense,
  members,
  isSelected,
  onSelect,
}: {
  expense: Expense;
  members: Members;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}) => {
  const payee = useMemo(
    () => members.find((mm) => mm.user_id === expense.created_by),
    [members]
  );

  // Payment dialog state
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState<string>("0.00");
  const [isOpen, setIsOpen] = useState(false);

  const totalShare = parseFloat(expense.yourShare);
  const currentPartialAmount = parseFloat(partialAmount);

  const handlePartialAmountChange = (delta: number) => {
    const newAmount = Math.max(
      0,
      Math.min(totalShare, currentPartialAmount + delta)
    );
    setPartialAmount(newAmount.toFixed(2));
  };

  const handlePaymentSubmit = () => {
    const amountToPay =
      paymentType === "full" ? totalShare : currentPartialAmount;
    console.log("Paying amount:", amountToPay);
    // TODO: Implement actual payment logic
    setIsOpen(false);
  };

  return (
    <tr className="hover:bg-blue-50">
      {/* checkbox */}
      <td className="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      </td>
      {/* date */}
      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
        <span className="text-sm font-medium text-gray-700">
          {new Date(expense.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </td>
      {/* expense title */}
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {expense.title}
            </p>
            {expense.description && (
              <p className="text-xs text-gray-500 truncate">
                {expense.description}
              </p>
            )}
          </div>
        </div>
      </td>
      {/* payer */}
      <td className="px-6 py-3 whitespace-nowrap hidden md:table-cell">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            {expense.description && (
              <p className="text-xs text-gray-500 truncate">
                {payee?.first_name} {payee?.last_name}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
        <div className="flex flex-col items-end gap-1">
          <span>${expense.yourShare}</span>
          <span className="text-xs text-gray-500">
            Your share: ${expense.amount}
          </span>
        </div>
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right hidden sm:table-cell">
        <StatusLabel isTrue={expense.isPaid} type={"expenses"} />
      </td>
      <td className="whitespace-nowrap py-3 pr-3 hidden sm:table-cell">
        <div className="flex justify-end gap-3">
          <div className="inline-flex items-center p-2 rounded hover:bg-gray-100">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger>
                <HandCoins className="w-5 h-5 text-gray-600" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Payment Details</DialogTitle>
                  <DialogDescription>
                    Make a payment for "{expense.title}" - Your total share: $
                    {expense.yourShare}
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
                      >
                        Pay Full Amount
                      </Button>
                      <Button
                        variant={
                          paymentType === "partial" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setPaymentType("partial")}
                        className="flex-1"
                      >
                        Pay Partial Amount
                      </Button>
                    </div>
                  </div>

                  {/* Partial Amount Controls */}
                  {paymentType === "partial" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Amount to Pay
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePartialAmountChange(-0.5)}
                          disabled={currentPartialAmount <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-semibold">
                            ${partialAmount}
                          </span>
                          <div className="text-xs text-gray-500">
                            Max: ${expense.yourShare}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePartialAmountChange(0.5)}
                          disabled={currentPartialAmount >= totalShare}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Quick amount buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPartialAmount((totalShare * 0.25).toFixed(2))
                          }
                          className="flex-1"
                        >
                          25%
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPartialAmount((totalShare * 0.5).toFixed(2))
                          }
                          className="flex-1"
                        >
                          50%
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPartialAmount((totalShare * 0.75).toFixed(2))
                          }
                          className="flex-1"
                        >
                          75%
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Total Share:</span>
                      <span className="font-medium">${expense.yourShare}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Amount to Pay:</span>
                      <span className="font-medium">
                        $
                        {paymentType === "full"
                          ? expense.yourShare
                          : partialAmount}
                      </span>
                    </div>
                    {paymentType === "partial" && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Remaining:</span>
                        <span>
                          ${(totalShare - currentPartialAmount).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePaymentSubmit}
                    disabled={
                      paymentType === "partial" && currentPartialAmount <= 0
                    }
                  >
                    {paymentType === "full"
                      ? "Pay Full Amount"
                      : `Pay $${partialAmount}`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <AlertDialog>
            <AlertDialogTrigger>
              <Trash className="w-5 h-5 text-gray-600" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
};

export default ExpenseItem;
