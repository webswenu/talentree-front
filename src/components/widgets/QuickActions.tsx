interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: "orange" | "turquoise" | "blue" | "green" | "yellow" | "red" | "purple" | "pink" | "gray";
    disabled?: boolean;
}

interface QuickActionsProps {
    actions: QuickAction[];
    title?: string;
    columns?: 2 | 3 | 4;
}

export const QuickActions = ({
    actions,
    title = "Acciones Rápidas",
    columns = 3,
}: QuickActionsProps) => {
    const colorClasses = {
        orange: "bg-gradient-to-br from-primary-500/60 to-primary-600/60 hover:from-primary-500/70 hover:to-primary-600/70",
        turquoise: "bg-gradient-to-br from-secondary-500/60 to-secondary-600/60 hover:from-secondary-500/70 hover:to-secondary-600/70",
        blue: "bg-gradient-to-br from-blue-500/60 to-blue-600/60 hover:from-blue-500/70 hover:to-blue-600/70",
        green: "bg-gradient-to-br from-green-500/60 to-green-600/60 hover:from-green-500/70 hover:to-green-600/70",
        yellow: "bg-gradient-to-br from-yellow-500/60 to-yellow-600/60 hover:from-yellow-500/70 hover:to-yellow-600/70",
        red: "bg-gradient-to-br from-red-500/60 to-red-600/60 hover:from-red-500/70 hover:to-red-600/70",
        purple: "bg-gradient-to-br from-purple-500/60 to-purple-600/60 hover:from-purple-500/70 hover:to-purple-600/70",
        pink: "bg-gradient-to-br from-pink-500/60 to-pink-600/60 hover:from-pink-500/70 hover:to-pink-600/70",
        gray: "bg-gradient-to-br from-gray-500/60 to-gray-600/60 hover:from-gray-500/70 hover:to-gray-600/70",
    };

    const gridCols = {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className="rounded-2xl p-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600/70 to-secondary-600/70 bg-clip-text mb-6">
                {title}
            </h3>

            <div className={`grid ${gridCols[columns]} gap-4`}>
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={`group p-6 rounded-2xl text-black transition-all duration-300 flex flex-col items-center justify-center space-y-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl hover:scale-105 border border-black/30 ${
                            colorClasses[action.color || "orange"]
                        }`}
                    >
                        <div className="w-12 h-12 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{action.icon}</div>
                        <span className="text-sm font-bold text-center">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
