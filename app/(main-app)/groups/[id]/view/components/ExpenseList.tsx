"use client";


import { useState, useMemo } from "react";
import Link from "next/link";
import ExpenseItem from "./ExpenseItem";
import { Expenses, Member } from "@/app/types";
import { Checkbox } from "@/components/ui/checkbox";

const ExpenseList = ({
  expenses,
  members,
  groupId,
}: {
  expenses: Expenses;
  members: Member[];
  groupId: string;
}) => {
  // State for selected expenses
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    new Set()
  );

  // Check if all expenses are selected
  const allSelected = useMemo(() => {
    return expenses.length > 0 && selectedExpenses.size === expenses.length;
  }, [expenses.length, selectedExpenses.size]);

  // Check if some expenses are selected (for indeterminate state)
  const someSelected = useMemo(() => {
    return selectedExpenses.size > 0 && selectedExpenses.size < expenses.length;
  }, [selectedExpenses.size, expenses.length]);

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    if (isChecked) {
      setSelectedExpenses(new Set(expenses.map((expense) => expense.id)));
    } else {
      setSelectedExpenses(new Set());
    }
  };

  const handleExpenseSelect = (expenseId: string, checked: boolean) => {
    const newSelected = new Set(selectedExpenses);
    if (checked) {
      newSelected.add(expenseId);
    } else {
      newSelected.delete(expenseId);
    }
    setSelectedExpenses(newSelected);
  };

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <div className="flex flex-row justify-between">
        <h2 className={`mb-4 text-xl md:text-2xl`}>Expenses</h2>
        <div className="flex text-sm text-blue-500 m-4 rounded-full border gap-3">
          <div className="cursor-pointer">Pay all</div>
          <div>
            <Link href={`/groups/${groupId}/create-expense`} className="">
              Create expense
            </Link>
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount / Your Share
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense, i) => (
                <ExpenseItem
                  key={i}
                  expense={expense}
                  members={members}
                  isSelected={selectedExpenses.has(expense.id)}
                  onSelect={(checked) =>
                    handleExpenseSelect(expense.id, checked)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
