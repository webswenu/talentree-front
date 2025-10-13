import { ReactNode } from 'react';

interface FilterPanelProps {
  title?: string;
  children: ReactNode;
  onClear?: () => void;
  onApply?: () => void;
}

export const FilterPanel = ({ title = 'Filtros', children, onClear, onApply }: FilterPanelProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {onClear && (
          <button
            onClick={onClear}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="space-y-3">{children}</div>

      {onApply && (
        <button
          onClick={onApply}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Aplicar Filtros
        </button>
      )}
    </div>
  );
};
