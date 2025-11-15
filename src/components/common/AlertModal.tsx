import { ReactNode } from "react";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string | ReactNode;
    type?: "success" | "error" | "info";
}

export const AlertModal = ({
    isOpen,
    onClose,
    title,
    message,
    type = "info",
}: AlertModalProps) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                );
            case "error":
                return (
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <svg
                            className="h-6 w-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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

    const getBorderColor = () => {
        switch (type) {
            case "success":
                return "border-t-4 border-green-500";
            case "error":
                return "border-t-4 border-red-500";
            default:
                return "border-t-4 border-blue-500";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/25 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
                className={`bg-white rounded-lg max-w-md w-full p-6 ${getBorderColor()}`}
            >
                {getIcon()}

                {/* Title */}
                <div className="text-center mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                </div>

                {/* Message */}
                <div className="text-center mb-6">
                    {typeof message === "string" ? (
                        <p className="text-gray-600">{message}</p>
                    ) : (
                        <div className="text-gray-600">{message}</div>
                    )}
                </div>

                {/* Action */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-6 py-2 text-white rounded-lg font-medium transition-colors ${
                            type === "success"
                                ? "bg-green-600 hover:bg-green-700"
                                : type === "error"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};
