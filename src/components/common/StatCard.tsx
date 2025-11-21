import { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 
        | "orange"
        | "turquoise"
        | "purple"
        | "pink"
        | "yellow"
        | "green"
        | "blue"
        | "gray";
}

export const StatCard = ({
    title,
    value,
    icon,
    trend,
    color = "orange",
}: StatCardProps) => {
    const colorClasses = {
        orange: "bg-gradient-to-br from-primary-500/60 to-primary-600/60",
        turquoise: "bg-gradient-to-br from-secondary-500/60 to-secondary-600/60",
        purple: "bg-gradient-to-br from-purple-500/60 to-purple-600/60",
        pink: "bg-gradient-to-br from-pink-500/60 to-pink-600/60",
        yellow: "bg-gradient-to-br from-yellow-500/60 to-yellow-600/60",
        green: "bg-gradient-to-br from-green-500/60 to-green-600/60",
        blue: "bg-gradient-to-br from-blue-500/60 to-blue-600/60",
        gray: "bg-gradient-to-br from-gray-500/60 to-gray-600/60",
    };

    return (
        <div
            className={`rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 animate-slide-up 
                group hover:shadow-xl border border-black/30 ${colorClasses[color]}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-bold text-black uppercase tracking-wide mb-2">
                        {title}
                    </p>
                    <p className="text-4xl font-black bg-gradient-to-r from-primary-600/70 to-secondary-600/70 bg-clip-text mt-1">
                        {value}
                    </p>
                    {trend && (
                        <div className="flex items-center mt-3 space-x-1">
                            <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                    trend.isPositive
                                        ? "bg-green-500/20 text-green-800"
                                        : "bg-red-500/20 text-red-800"
                                }`}
                            >
                                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                            </span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="p-4 rounded-2xl bg-gray-100 text-gray-700 shadow-lg transform 
                        group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 
                        flex items-center justify-center text-3xl"
                    >
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};
