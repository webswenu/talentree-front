interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onNext?: () => void;
    onPrevious?: () => void;
    showFirstLast?: boolean;
}

export const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    onNext,
    onPrevious,
    showFirstLast = true,
}: PaginationProps) => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            {showFirstLast && currentPage > 1 && (
                <button
                    onClick={() => onPageChange(1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Primera
                </button>
            )}

            <button
                onClick={() => {
                    if (onPrevious) {
                        onPrevious();
                    } else {
                        onPageChange(currentPage - 1);
                    }
                }}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Anterior
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                        page === currentPage
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => {
                    if (onNext) {
                        onNext();
                    } else {
                        onPageChange(currentPage + 1);
                    }
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Siguiente
            </button>

            {showFirstLast && currentPage < totalPages && (
                <button
                    onClick={() => onPageChange(totalPages)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Última
                </button>
            )}
        </div>
    );
};
