import { StatCard } from "../common/StatCard";

interface QuickStatsProps {
    stats: Array<{
        title: string;
        value: string | number;
        icon?: React.ReactNode;
        trend?: { value: number; isPositive: boolean };
        color?: "blue" | "green" | "yellow" | "red" | "gray";
    }>;
    columns?: 2 | 3 | 4;
}

export const QuickStats = ({ stats, columns = 4 }: QuickStatsProps) => {
    const gridCols = {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-6`}>
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};
