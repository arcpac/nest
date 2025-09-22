import { lusitana } from "@/app/ui/fonts";
import React from "react";
import Link from "next/link";
import ExpenseItem from "./ExpenseItem";
import { Expenses } from "@/app/types";

const ExpenseList = ({
  expenses,
  groupId,
}: {
  expenses: Expenses;
  groupId: string;
}) => {
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
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense, i) => (
                <ExpenseItem key={i} expense={expense} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
