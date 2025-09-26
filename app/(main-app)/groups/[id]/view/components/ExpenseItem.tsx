import React from "react";
import { Label } from "@/components/ui/label";
import { CheckIcon, ClockIcon, Pencil, Trash } from "lucide-react";

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
import { Expense } from "@/app/types";
import StatusLabel from "../../../components/Status";

const ExpenseItem = ({ expense }: { expense: Expense }) => {
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
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {(expense.title || "?").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="size-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {(expense.title || "?").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="size-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {(expense.title || "?").charAt(0).toUpperCase()}
            </span>
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
      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
        <StatusLabel isTrue={expense.isPaid} />
      </td>
      <td className="whitespace-nowrap py-3 pr-3">
        <div className="flex justify-end gap-3">
          <div className="inline-flex items-center p-2 rounded hover:bg-gray-100">
            <Pencil className="w-5 h-5 text-gray-600" />
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
