"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ExpenseItem from "./ExpenseItem";
import { Expenses, Member } from "@/app/types";
import { Checkbox } from "@/components/ui/checkbox";
import Pagination from "@/app/(main-app)/components/Pagination";

const ExpenseList = ({
  expenses,
  members,
  groupId,
}: {
  expenses: Expenses;
  members: Member[];
  groupId: string;
}) => {
  const [currentPage, setPage] = useState(1);
  const pageSize = 5;
  const visibleExpenses = expenses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
console.log('visibleExpenses', visibleExpenses)
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
        <div className="bg-white rounded-lg">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] md:min-w-0">
              <thead className="border-b">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                          ? "indeterminate"
                          : false
                      }
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Payer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount / Your Share
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleExpenses.map((expense, i) => (
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
      <div className="flex justify-center mt-5">
        <Pagination totalPages={5} setPage={setPage} />
      </div>
    </div>
  );
};

export default ExpenseList;
