"use client";

import React, { memo, useCallback, useRef } from "react";

type StatusFilter = "all" | "paid" | "unpaid";

type FilterButtonsProps = {
    activeFilter: StatusFilter;
    onChange: (next: StatusFilter) => void;
};

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "paid", label: "Paid" },
    { id: "unpaid", label: "Unpaid" },
];

function FilterButtonsImpl({ activeFilter, onChange }: FilterButtonsProps) {
    const handleChange = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            onChange(event.currentTarget.value as StatusFilter);
        },
        [onChange]
    );

    return (
        <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((filter) => {
                const isActive = filter.id === activeFilter;

                return (
                    <button
                        key={filter.id}
                        type="button"
                        value={filter.id}
                        onClick={handleChange}
                        aria-pressed={isActive}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${isActive
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-600"
                            }`}
                    >
                        {filter.label}
                    </button>
                );
            })}
        </div>
    );
}

export default memo(FilterButtonsImpl);
