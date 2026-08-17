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
        <div className="glass-white rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600/70 to-secondary-600/70 bg-clip-text ">{title}</h3>
                {viewAllLink && (
                    <button
                        onClick={viewAllLink.onClick}
                        className="text-sm font-bold bg-gradient-to-r from-primary-600/70 to-secondary-600/70 bg-clip-text hover:scale-110 transition-transform duration-300 self-start"
                    >
                        {viewAllLink.label} →
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 font-medium">
                        {emptyMessage}
                    </div>
                ) : (
                    items.map((item) => {
                        // P-11: mismo criterio que StatCard. Un elemento de
                        // lista que navega a otra pantalla es un botón, no un
                        // div con onClick: así se alcanza con Tab y se activa
                        // con Enter o Espacio sin escribir nada a mano.
                        const Item = item.onClick ? "button" : "div";
                        return (
                        <Item
                            key={item.id}
                            {...(item.onClick
                                ? { type: "button" as const, onClick: item.onClick }
                                : {})}
                            className={`w-full text-left p-3 sm:p-4 rounded-xl border border-white/15 bg-white/8 transition-all duration-300 ${
                                item.onClick
                                    ? "cursor-pointer hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-1"
                                    : ""
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 break-words">
                                        {item.title}
                                    </h4>
                                    {item.subtitle && (
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium break-words">
                                            {item.subtitle}
                                        </p>
                                    )}
                                </div>
                                {item.status && (
                                    <span
                                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-xl flex-shrink-0 shadow-md self-start ${
                                            statusColors[item.status.color]
                                        }`}
                                    >
                                        {item.status.label}
                                    </span>
                                )}
                            </div>
                            {item.meta && (
                                <p className="text-xs text-gray-500 mt-2 font-medium">
                                    {item.meta}
                                </p>
                            )}
                        </Item>
                        );
                    })
                )}
            </div>
        </div>
    );
};
