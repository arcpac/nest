"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const setPage = (nextPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(nextPage));
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="mt-4 flex items-center justify-between">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Prev
            </button>

            <span>
                Page {page} / {totalPages}
            </span>

            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
            </button>
        </div>
    );
}


export default Pagination