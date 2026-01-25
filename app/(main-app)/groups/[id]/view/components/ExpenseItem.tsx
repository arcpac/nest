"use client";

import React, { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HandCoins,
} from "lucide-react";

import { Expense, Members } from "@/app/types";
import { StatusLabel } from "../../../components/Status";
import { useModalStore } from "@/app/stores/ModalProvider";

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
  const openModal = useModalStore((modalStore) => modalStore.open)


  const totalShare = parseFloat(expense.yourShare);
  const currentPartialAmount = parseFloat(partialAmount);

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
          <div className="inline-flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => openModal("pay-expense", { members: members, expenseId: expense.id })}
          >
            <HandCoins className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ExpenseItem;
