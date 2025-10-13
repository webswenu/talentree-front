import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  debounceTime?: number;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const SearchInput = ({
  placeholder = 'Buscar...',
  onSearch,
  debounceTime = 300,
  value: externalValue,
  onChange: externalOnChange,
  className = ''
}: SearchInputProps) => {
  const [internalQuery, setInternalQuery] = useState('');

  // Usar valor externo si se proporciona, sino usar interno
  const query = externalValue !== undefined ? externalValue : internalQuery;
  const setQuery = externalOnChange || setInternalQuery;

  const debouncedQuery = useDebounce(query, debounceTime);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
