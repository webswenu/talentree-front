interface PieChartProps {
    data: Array<{ label: string; value: number; color: string }>;
    title?: string;
    size?: number;
    showLegend?: boolean;
}

export const PieChart = ({
    data,
    title,
    size = 200,
    showLegend = true,
}: PieChartProps) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const slices = data.map((item) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        return {
            ...item,
            percentage,
            startAngle,
            endAngle: currentAngle,
        };
    });

    const radius = size / 2;
    const strokeWidth = size / 5;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {title}
                </h3>
            )}

            <div className="flex items-center justify-center gap-8">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg
                        width={size}
                        height={size}
                        className="transform -rotate-90"
                    >
                        {slices.map((slice, index) => {
                            const circumference =
                                2 * Math.PI * (radius - strokeWidth / 2);
                            const strokeDasharray = `${
                                (slice.percentage / 100) * circumference
                            } ${circumference}`;
                            const strokeDashoffset = -(
                                (slice.startAngle / 360) *
                                circumference
                            );

                            return (
                                <circle
                                    key={index}
                                    cx={radius}
                                    cy={radius}
                                    r={radius - strokeWidth / 2}
                                    fill="none"
                                    stroke={slice.color}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-500"
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {total}
                            </div>
                            <div className="text-xs text-gray-500">Total</div>
                        </div>
                    </div>
                </div>

                {showLegend && (
                    <div className="space-y-2">
                        {slices.map((slice, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: slice.color }}
                                />
                                <div className="text-sm">
                                    <span className="font-medium text-gray-900">
                                        {slice.label}
                                    </span>
                                    <span className="text-gray-500 ml-2">
                                        {slice.value} (
                                        {slice.percentage.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
