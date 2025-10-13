interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
  height?: number;
  showValues?: boolean;
}

export const BarChart = ({ data, title, height = 300, showValues = true }: BarChartProps) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}

      <div className="space-y-4" style={{ height }}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const color = item.color || 'bg-blue-600';

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                {showValues && (
                  <span className="text-gray-600">{item.value.toLocaleString()}</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 10 && showValues && `${percentage.toFixed(0)}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
