import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

type ExpenseProps = {
  id: string;
  title: string;
  amount: string;
  description: string | null;
  isEqual: boolean;
  created_by: string;
  createdAt: Date;
  yourShare: string;
  isPaid: boolean;
};

const ExpenseItem = ({ expense }: { expense: ExpenseProps }) => {
  return (
    <tr className="hover:bg-blue-50">
      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
        <span className="text-sm font-medium text-gray-700">
          {new Date(expense.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </td>
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {(expense.title || "?").charAt(0).toUpperCase()}
            </span>
          </div>
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
      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
        <div className="flex flex-col items-end gap-1">
          <span>${expense.amount}</span>
          <span className="text-xs text-gray-500">
            Your share: ${expense.yourShare}
          </span>
        </div>
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
        {expense.isPaid ? (
          <div className="flex flex-col items-end gap-1">
            <Label
              htmlFor="r2"
              className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-medium text-white"
            >
              Paid
            </Label>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <Label
              htmlFor="r2"
              className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-orange-400 px-3 py-1.5 text-xs font-medium text-white"
            >
              Pending
            </Label>
          </div>
        )}

        {/* <div className="flex flex-col items-end gap-1">
          <span>${expense.amount}</span>
          <span className="text-xs text-gray-500">
            Your share: ${expense.yourShare}
          </span>
        </div> */}
      </td>
    </tr>
  );
};

export default ExpenseItem;
