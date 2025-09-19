import React from "react";
import { lusitana } from "@/app/ui/fonts";

type ExpenseProps = {
  id: string;
  title: string;
  amount: string;
  description: string | null;
  created_by: string;
  groupId: string;
  createdAt: Date;
  expenseShare?: string;
};

const ExpenseItem = ({ expense }: { expense: ExpenseProps }) => {

  return (
    <div className="flex w-full items-center justify-between transition-shadow">
      {/* Left Section */}
      <div className="flex flex-col min-w-0">
        <p className="truncate text-sm font-semibold md:text-base">
          {expense.title}
        </p>
        {expense.description && (
          <p className="truncate text-xs text-gray-500 md:text-sm">
            {expense.description}
          </p>
        )}
        <p className="hidden text-xs text-gray-500 sm:block mt-1">
          {new Date(expense.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Right Section: Expense + Share */}
      <div className="flex items-center gap-6">
        {/* Expense Block */}
        <div className="flex flex-col items-end gap-1">
          <p className="text-sm font-medium md:text-base">${expense.amount}</p>
          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
            Expense
          </span>
        </div>

        {/* Share Block */}
        <div className="flex flex-col items-end gap-1">
          <p className="text-sm font-medium md:text-base">
            ${expense.expenseShare}
          </p>
          <span className="rounded-full bg-orange-200 px-3 py-1 text-xs font-medium text-gray-700">
            Share
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;
