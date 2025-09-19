import { lusitana } from "@/app/ui/fonts";
import React from "react";
import ExpenseItem from "./ExpenseItem";
import clsx from "clsx";
type ExpensesProps = {
  id: string;
  title: string;
  amount: string;
  description: string | null;
  created_by: string;
  groupId: string;
  createdAt: Date;
  expenseShare?: string;
}[];
const ExpenseList = ({ expenses }: { expenses: ExpensesProps }) => {
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Expenses
      </h2>
      <div className="flex justify-between flex-col rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {expenses.map((expense, i) => {
            return (
              <div
                key={i}
                className={clsx(
                  "flex flex-row items-center justify-between py-4",
                  {
                    "border-t": i !== 0,
                  }
                )}
              >
                <ExpenseItem expense={expense} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
