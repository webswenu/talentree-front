interface Activity {
    id: string | number;
    user: string;
    action: string;
    target?: string;
    time: string;
    type?: "create" | "update" | "delete" | "info";
}

interface ActivityFeedProps {
    activities: Activity[];
    title?: string;
    maxItems?: number;
}

export const ActivityFeed = ({
    activities,
    title = "Actividad Reciente",
    maxItems = 10,
}: ActivityFeedProps) => {
    const displayActivities = activities.slice(0, maxItems);

    const getTypeIcon = (type?: string) => {
        switch (type) {
            case "create":
                return (
                    <div className="bg-green-100 text-green-600 p-2 rounded-full">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    </div>
                );
            case "update":
                return (
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </div>
                );
            case "delete":
                return (
                    <div className="bg-red-100 text-red-600 p-2 rounded-full">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="bg-gray-100 text-gray-600 p-2 rounded-full">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className=" rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600/70 to-secondary-600/70 bg-clip-text mb-6">
                {title}
            </h3>

            <div className="space-y-3">
                {displayActivities.map((activity) => (
                    <div
                        key={activity.id}
                        className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl bg-white/8 hover:bg-white/12 transition-all duration-300 border border-black/30"
                    >
                        <div className="flex-shrink-0">
                            {getTypeIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-gray-900 break-words">
                                <span className="font-bold">
                                    {activity.user}
                                </span>{" "}
                                <span className="text-gray-700 font-medium">
                                    {activity.action}
                                </span>
                                {activity.target && (
                                    <span className="font-bold text-primary-600/80">
                                        {" "}
                                        {activity.target}
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                {activity.time}
                            </p>
                        </div>
                    </div>
                ))}

                {activities.length === 0 && (
                    <div className="text-center py-12 text-gray-500 font-medium">
                        No hay actividad reciente
                    </div>
                )}
            </div>
        </div>
    );
};
