interface ListItem {
    id: string | number;
    title: string;
    subtitle?: string;
    status?: {
        label: string;
        color: "blue" | "green" | "yellow" | "red" | "gray";
    };
    meta?: string;
    onClick?: () => void;
}

interface RecentListProps {
    items: ListItem[];
    title: string;
    emptyMessage?: string;
    viewAllLink?: {
        label: string;
        onClick: () => void;
    };
}

export const RecentList = ({
    items,
    title,
    emptyMessage = "No hay elementos",
    viewAllLink,
}: RecentListProps) => {
    const statusColors = {
        blue: "bg-blue-100 text-blue-800",
        green: "bg-green-100 text-green-800",
        yellow: "bg-yellow-100 text-yellow-800",
        red: "bg-red-100 text-red-800",
        gray: "bg-gray-100 text-gray-800",
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {viewAllLink && (
                    <button
                        onClick={viewAllLink.onClick}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {viewAllLink.label} →
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {emptyMessage}
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            onClick={item.onClick}
                            className={`p-3 rounded-lg border border-gray-200 ${
                                item.onClick
                                    ? "cursor-pointer hover:bg-gray-50"
                                    : ""
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {item.title}
                                    </h4>
                                    {item.subtitle && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {item.subtitle}
                                        </p>
                                    )}
                                </div>
                                {item.status && (
                                    <span
                                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                                            statusColors[item.status.color]
                                        }`}
                                    >
                                        {item.status.label}
                                    </span>
                                )}
                            </div>
                            {item.meta && (
                                <p className="text-xs text-gray-500 mt-2">
                                    {item.meta}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
