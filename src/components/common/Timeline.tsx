interface TimelineItem {
    id: string | number;
    title: string;
    description?: string;
    date: string;
    icon?: React.ReactNode;
    type?: "success" | "warning" | "error" | "info" | "default";
}

interface TimelineProps {
    items: TimelineItem[];
    orientation?: "vertical" | "horizontal";
}

export const Timeline = ({
    items,
    orientation = "vertical",
}: TimelineProps) => {
    const getTypeColor = (type?: string) => {
        switch (type) {
            case "success":
                return "bg-green-500";
            case "warning":
                return "bg-yellow-500";
            case "error":
                return "bg-red-500";
            case "info":
                return "bg-blue-500";
            default:
                return "bg-gray-400";
        }
    };

    if (orientation === "horizontal") {
        return (
            <div className="flex items-start space-x-4 overflow-x-auto pb-4">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="flex flex-col items-center min-w-[200px]"
                    >
                        <div className="flex items-center w-full">
                            <div
                                className={`w-10 h-10 rounded-full ${getTypeColor(
                                    item.type
                                )} flex items-center justify-center text-white flex-shrink-0`}
                            >
                                {item.icon || (
                                    <span className="font-bold">
                                        {index + 1}
                                    </span>
                                )}
                            </div>
                            {index < items.length - 1 && (
                                <div className="flex-1 h-0.5 bg-gray-300 mx-2" />
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <h4 className="font-semibold text-gray-900">
                                {item.title}
                            </h4>
                            {item.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {item.description}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                                {item.date}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {items.map((item, index) => (
                <div key={item.id} className="flex">
                    <div className="flex flex-col items-center mr-4">
                        <div
                            className={`w-10 h-10 rounded-full ${getTypeColor(
                                item.type
                            )} flex items-center justify-center text-white flex-shrink-0`}
                        >
                            {item.icon || (
                                <span className="font-bold">{index + 1}</span>
                            )}
                        </div>
                        {index < items.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 mt-2" />
                        )}
                    </div>
                    <div className="flex-1 pb-8">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">
                                        {item.title}
                                    </h4>
                                    {item.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                                    {item.date}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
