import { useState } from 'react';

type FilterValues = Record<string, any>;

export function useFilter<T extends FilterValues>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters);

  const setFilter = (key: keyof T, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const resetFilter = (key: keyof T) => {
    setFilters(prev => ({
      ...prev,
      [key]: initialFilters[key]
    }));
  };

  return {
    filters,
    setFilter,
    clearFilters,
    resetFilter,
    setFilters
  };
}
