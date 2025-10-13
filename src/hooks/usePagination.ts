import { useState, useMemo } from 'react';

// Soporte para ambas formas de llamada
export function usePagination<T>(dataOrProps: T[] | { data: T[]; itemsPerPage?: number }, itemsPerPageParam?: number) {
  // Determinar si se pasó un objeto o un array
  const data = Array.isArray(dataOrProps) ? dataOrProps : dataOrProps.data;
  const itemsPerPage = Array.isArray(dataOrProps)
    ? (itemsPerPageParam || 10)
    : (dataOrProps.itemsPerPage || 10);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const pageSize = itemsPerPage;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const prevPage = previousPage; // Alias

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  return {
    currentPage,
    totalPages,
    pageSize,
    paginatedData,
    goToPage,
    nextPage,
    previousPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}
