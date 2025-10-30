import { ReactNode } from "react";

interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => ReactNode;
    align?: "left" | "center" | "right";
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    isLoading?: boolean;
}

export function Table<T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    emptyMessage = "No hay datos disponibles",
    isLoading = false,
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-12 text-center text-gray-500">
                    Cargando...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                    column.align === "right"
                                        ? "text-right"
                                        : column.align === "center"
                                        ? "text-center"
                                        : "text-left"
                                }`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-12 text-center text-gray-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => onRowClick?.(item)}
                                className={
                                    onRowClick
                                        ? "hover:bg-gray-50 cursor-pointer"
                                        : ""
                                }
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`px-6 py-4 whitespace-nowrap ${
                                            column.align === "right"
                                                ? "text-right"
                                                : column.align === "center"
                                                ? "text-center"
                                                : "text-left"
                                        }`}
                                    >
                                        {column.render
                                            ? column.render(item)
                                            : String(
                                                  (
                                                      item as Record<
                                                          string,
                                                          unknown
                                                      >
                                                  )[column.key] ?? "-"
                                              )}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
