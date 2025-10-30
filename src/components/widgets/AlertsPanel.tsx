interface Alert {
    id: string | number;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
    time: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface AlertsPanelProps {
    alerts: Alert[];
    title?: string;
    onDismiss?: (id: string | number) => void;
}

export const AlertsPanel = ({
    alerts,
    title = "Alertas",
    onDismiss,
}: AlertsPanelProps) => {
    const alertStyles = {
        info: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            icon: "text-blue-600",
            text: "text-blue-900",
        },
        warning: {
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            icon: "text-yellow-600",
            text: "text-yellow-900",
        },
        error: {
            bg: "bg-red-50",
            border: "border-red-200",
            icon: "text-red-600",
            text: "text-red-900",
        },
        success: {
            bg: "bg-green-50",
            border: "border-green-200",
            icon: "text-green-600",
            text: "text-green-900",
        },
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "error":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                );
            case "warning":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                );
            case "success":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                );
            default:
                return (
                    <svg
                        className="w-5 h-5"
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
                );
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {title}
            </h3>

            <div className="space-y-3">
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay alertas
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const styles = alertStyles[alert.type];
                        return (
                            <div
                                key={alert.id}
                                className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}
                            >
                                <div className="flex items-start">
                                    <div
                                        className={`flex-shrink-0 ${styles.icon}`}
                                    >
                                        {getIcon(alert.type)}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <h4
                                            className={`text-sm font-medium ${styles.text}`}
                                        >
                                            {alert.title}
                                        </h4>
                                        <p
                                            className={`text-sm mt-1 ${styles.text} opacity-90`}
                                        >
                                            {alert.message}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {alert.time}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {alert.action && (
                                                    <button
                                                        onClick={
                                                            alert.action.onClick
                                                        }
                                                        className={`text-xs font-medium ${styles.icon} hover:underline`}
                                                    >
                                                        {alert.action.label}
                                                    </button>
                                                )}
                                                {onDismiss && (
                                                    <button
                                                        onClick={() =>
                                                            onDismiss(alert.id)
                                                        }
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
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
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
