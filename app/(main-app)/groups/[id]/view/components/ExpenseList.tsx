import { lusitana } from "@/app/ui/fonts";
import React from "react";
import ExpenseItem from "./ExpenseItem";
import clsx from "clsx";
import Link from "next/link";
type ExpensesProps = {
  id: string;
  title: string;
  amount: string;
  description: string | null;
  isEqual: boolean;
  created_by: string;
  createdAt: Date;
  yourShare: string;
}[];

const ExpenseList = ({ expenses, groupId }: { expenses: ExpensesProps; groupId: string }) => {
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <div className="flex flex-row justify-between">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Expenses
        </h2>
        <div className="text-sm text-blue-500 m-4 rounded-full ">
          <Link href={`/groups/${groupId}/create-expense`} className="">
            Create expense
          </Link>
        </div>
      </div>
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
