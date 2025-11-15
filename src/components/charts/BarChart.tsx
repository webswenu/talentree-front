interface BarChartProps {
    data: Array<{ label: string; value: number; color?: string }>;
    title?: string;
    height?: number;
    showValues?: boolean;
}

export const BarChart = ({
    data,
    title,
    height = 300,
    showValues = true,
}: BarChartProps) => {
    const maxValue = Math.max(...data.map((d) => d.value));

    return (
        <div className="glass-white rounded-2xl p-6">
            {title && (
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600/70 to-secondary-600/70 bg-clip-text mb-6">
                    {title}
                </h3>
            )}

            <div className="space-y-4" style={{ height }}>
                {data.map((item, index) => {
                    const percentage = (item.value / maxValue) * 100;
                    const isEven = index % 2 === 0;
                    const gradient = isEven
                        ? "bg-gradient-to-r from-primary-500/60 to-primary-600/60"
                        : "bg-gradient-to-r from-secondary-500/60 to-secondary-600/60";

                    return (
                        <div key={index} className="space-y-2 group">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold text-gray-800 group-hover:text-primary-600/80 transition-colors">
                                    {item.label}
                                </span>
                                {showValues && (
                                    <span className="font-bold text-gray-800 bg-white/15 px-3 py-1 rounded-lg">
                                        {item.value.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <div className="w-full bg-white/10 rounded-xl h-10 overflow-hidden shadow-inner border border-white/15">
                                <div
                                    className={`h-full ${gradient} rounded-xl flex items-center justify-end pr-3 text-black text-xs font-bold transition-all duration-700 ease-out hover:opacity-90 border border-black/20`}
                                    style={{ width: `${percentage}%` }}
                                >
                                    {percentage > 15 &&
                                        showValues &&
                                        `${percentage.toFixed(0)}%`}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
