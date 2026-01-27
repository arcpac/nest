"use client";

import { useState, useMemo } from "react";
import ExpenseItem from "./ExpenseItem";
import { Expenses, GroupExpenseShare, Member } from "@/app/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useModalStore } from "@/app/stores/ModalProvider";

const ExpenseList = ({
  expenses,
  members,
  groupId,
}: {
  expenses: GroupExpenseShare[];
  members: Member[];
  groupId: string;
}) => {
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    new Set()
  );
  const openModal = useModalStore((modalStore) => modalStore.open)

  const allSelected = useMemo(() => {
    return expenses.length > 0 && selectedExpenses.size === expenses.length;
  }, [expenses.length, selectedExpenses.size]);

  // Check if some expenses are selected (for indeterminate state)
  const someSelected = useMemo(() => {
    return selectedExpenses.size > 0 && selectedExpenses.size < expenses.length;
  }, [selectedExpenses.size, expenses.length]);

  const disabledButton = !someSelected && !allSelected;

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
  console.log('Expenses in ExpenseList: ', expenses)
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <div className="rounded-xl bg-gray-50 p-2">

        <div className="flex flex-row justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 md:p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Unpaid expenses
            </span>
          </div>
          <div className="flex items-center text-sm p-2 m-4 rounded-full border border-blue-200/70 gap-3">
            <button
              disabled={disabledButton}
              className={`nest-button nest-button--outline ${disabledButton ? "cursor-not-allowed opacity-50" : ""
                }`}
              onClick={() => openModal('pay-expense', { selectedExpenses: selectedExpenses })}
            >
              Pay all
            </button>
            <div className="nest-button nest-button--outline cursor-pointer"
              onClick={() => openModal("add-expense", { members: members })}>
              Create expense
            </div>
            {!disabledButton &&
              <button
                disabled={disabledButton}
                className={`nest-button nest-button--danger ${disabledButton ? "cursor-not-allowed opacity-50" : ""
                  }`}
                onClick={() =>
                  openModal("delete-expenses", {
                    expenseIds: Array.from(selectedExpenses),
                  })
                }
              >
                Delete expenses
              </button>
            }
          </div>
        </div>
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
    </div>
  );
};

export default ExpenseList;
