import { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: "blue" | "green" | "yellow" | "red" | "gray";
}

export const StatCard = ({
    title,
    value,
    icon,
    trend,
    color = "blue",
}: StatCardProps) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        yellow: "bg-yellow-50 text-yellow-600",
        red: "bg-red-50 text-red-600",
        gray: "bg-gray-50 text-gray-600",
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {value}
                    </p>
                    {trend && (
                        <div className="flex items-center mt-2">
                            <span
                                className={`text-sm font-medium ${
                                    trend.isPositive
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {trend.isPositive ? "↑" : "↓"}{" "}
                                {Math.abs(trend.value)}%
                            </span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};
