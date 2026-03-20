import { BiChevronLeft, BiChevronRight, BiChevronsLeft, BiChevronsRight } from "react-icons/bi";

type UsersPaginationProps = {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
};

export function UsersPagination({
    page,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
}: UsersPaginationProps) {
    const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Affichage de <span className="font-medium text-slate-900 dark:text-slate-100">{start}</span>
                {" – "}
                <span className="font-medium text-slate-900 dark:text-slate-100">{end}</span>
                {" sur "}
                <span className="font-medium text-slate-900 dark:text-slate-100">{totalItems}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    disabled={page <= 1}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                    <BiChevronsLeft className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                    <BiChevronLeft className="h-4 w-4" />
                </button>

                <div className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                    Page {page} / {Math.max(totalPages, 1)}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                    <BiChevronRight className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={() => onPageChange(totalPages)}
                    disabled={page >= totalPages}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                    <BiChevronsRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}