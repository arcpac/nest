"use client";

import React, { memo, Suspense, useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import CardWrapper from "../../components/Cards";

import { lusitana } from "@/app/ui/fonts";
import { Skeleton } from "@/components/ui/skeleton";
import { HouseholdSkeleton } from "../../groups/components/HouseholdSkeleton";
import FilterButtons from "./FilterButtons";

interface UserExpenseShare {
    id: string;
    expenseTitle: string;
    expenseAmount: string;
    groupName: string;
    paid: boolean;
}

type UserExpenseSharesProps = {
    userExpenseShares: UserExpenseShare[];
};

type StatusFilter = "all" | "paid" | "unpaid";

const amountFormatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const ExpenseView = ({ userExpenseShares }: UserExpenseSharesProps) => {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const handleFilterChange = useCallback((filter: StatusFilter) => {
        setStatusFilter(filter);
    }, []);

    const filteredShares = useMemo(() => {
        if (!userExpenseShares?.length || statusFilter === "all") return userExpenseShares;
        const shouldBePaid = statusFilter === "paid";
        return userExpenseShares.filter((s) => s.paid === shouldBePaid);
    }, [userExpenseShares, statusFilter]);

    return (
        <div className="w-full">
            <div className="flex flex-row justify-start items-center mb-3">
                <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                    Expense shares
                </h1>
                <div className="text-sm text-blue-500 m-4 rounded-full ">
                    <Link href="/household">asdfsdf</Link>
                </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<Skeleton />}>
                    <CardWrapper />
                </Suspense>
            </div>
            <Suspense fallback={<HouseholdSkeleton />}>
                <div className="mt-6 flow-root">
                    <div className="inline-block min-w-full align-middle">
                        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 p-2 md:p-4">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Filter by status
                                </span>
                                <FilterButtons
                                    activeFilter={statusFilter}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="md:hidden">
                                {filteredShares?.map((share, i) => (
                                    <div
                                        key={share.id}
                                        className="mb-2 w-full rounded-md bg-white p-4"
                                    >
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <div className="mb-2 flex items-center">
                                                <p>{share.expenseTitle}</p>
                                            </div>
                                        </div>
                                        <div className="flex w-full items-center justify-between pt-4">
                                            <div>
                                                <p className="text-xl font-medium">
                                                    {amountFormatter.format(Number(share.expenseAmount))}
                                                </p>
                                                <p>{share.paid ? "Paid" : "Unpaid"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <table className="hidden min-w-full text-gray-900 md:table">
                                <thead className="rounded-lg text-left text-sm font-normal">
                                    <tr>
                                        <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                            Expense
                                        </th>
                                        <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                            Group Name
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-medium">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {filteredShares?.map((share) => (
                                        <tr key={share.id} className="border-b last:border-none">
                                            <td className="whitespace-nowrap px-4 py-5 text-sm sm:pl-6">
                                                {share.expenseTitle}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                {share.groupName}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                {amountFormatter.format(Number(share.expenseAmount))}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                {share.paid ? "Paid" : "Unpaid"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Suspense>
        </div>
    );
};

export default ExpenseView;
