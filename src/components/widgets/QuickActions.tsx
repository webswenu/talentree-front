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
        orange: "bg-gradient-to-br from-orange-400/50 to-orange-600/50 hover:from-orange-500/60 hover:to-orange-700/60 text-gray-900",
        turquoise: "bg-gradient-to-br from-teal-400/50 to-teal-600/50 hover:from-teal-500/60 hover:to-teal-700/60 text-gray-900",
        blue: "bg-gradient-to-br from-blue-400/50 to-blue-600/50 hover:from-blue-500/60 hover:to-blue-700/60 text-gray-900",
        green: "bg-gradient-to-br from-green-400/50 to-green-600/50 hover:from-green-500/60 hover:to-green-700/60 text-gray-900",
        yellow: "bg-gradient-to-br from-yellow-400/50 to-yellow-600/50 hover:from-yellow-500/60 hover:to-yellow-700/60 text-gray-900",
        red: "bg-gradient-to-br from-red-400/50 to-red-600/50 hover:from-red-500/60 hover:to-red-700/60 text-gray-900",
        purple: "bg-gradient-to-br from-purple-400/50 to-purple-600/50 hover:from-purple-500/60 hover:to-purple-700/60 text-gray-900",
        pink: "bg-gradient-to-br from-pink-400/50 to-pink-600/50 hover:from-pink-500/60 hover:to-pink-700/60 text-gray-900",
        gray: "bg-gradient-to-br from-gray-400/50 to-gray-600/50 hover:from-gray-500/60 hover:to-gray-700/60 text-gray-900",
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
                        className={`group p-8 rounded-2xl transition-all duration-300 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 border-2 border-white/30 ${
                            colorClasses[action.color || "orange"]
                        }`}
                    >
                        <div className="w-16 h-16 md:w-12 md:h-12 flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 drop-shadow-lg">{action.icon}</div>
                        <span className="text-base font-black text-center md:text-left uppercase tracking-wide drop-shadow-md">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
