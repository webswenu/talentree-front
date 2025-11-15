interface DataPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    data: DataPoint[];
    title?: string;
    height?: number;
    color?: string;
    showGrid?: boolean;
    showPoints?: boolean;
}

export const LineChart = ({
    data,
    title,
    height = 300,
    color = "#2563eb",
    showGrid = true,
    showPoints = true,
}: LineChartProps) => {
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue || 1;

    const padding = 40;
    const chartHeight = height - padding * 2;
    const chartWidth = 600;
    const stepX = chartWidth / (data.length - 1 || 1);

    const points = data.map((point, index) => {
        const x = index * stepX + padding;
        const y =
            height - padding - ((point.value - minValue) / range) * chartHeight;
        return { x, y, ...point };
    });

    const pathD = points
        .map((point, index) => {
            if (index === 0) return `M ${point.x} ${point.y}`;
            return `L ${point.x} ${point.y}`;
        })
        .join(" ");

    const areaD = `${pathD} L ${points[points.length - 1].x} ${
        height - padding
    } L ${padding} ${height - padding} Z`;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {title}
                </h3>
            )}

            <svg
                width="100%"
                height={height}
                viewBox={`0 0 ${chartWidth + padding * 2} ${height}`}
            >
                {/* Grid */}
                {showGrid && (
                    <g className="text-gray-300">
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                            const y = height - padding - ratio * chartHeight;
                            return (
                                <g key={ratio}>
                                    <line
                                        x1={padding}
                                        y1={y}
                                        x2={chartWidth + padding}
                                        y2={y}
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeDasharray="4"
                                    />
                                    <text
                                        x={padding - 10}
                                        y={y + 4}
                                        textAnchor="end"
                                        className="text-xs fill-gray-500"
                                    >
                                        {Math.round(minValue + ratio * range)}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                )}

                {/* Area under line */}
                <path d={areaD} fill={color} fillOpacity="0.1" />

                {/* Line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points */}
                {showPoints &&
                    points.map((point, index) => (
                        <g key={index}>
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill="white"
                                stroke={color}
                                strokeWidth="3"
                            />
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="2"
                                fill={color}
                            />
                        </g>
                    ))}

                {/* X-axis labels */}
                {data.map((point, index) => {
                    const x = index * stepX + padding;
                    return (
                        <text
                            key={index}
                            x={x}
                            y={height - padding + 20}
                            textAnchor="middle"
                            className="text-xs fill-gray-500"
                        >
                            {point.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};
