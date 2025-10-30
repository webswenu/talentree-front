import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    onClick?: () => void;
    className?: string;
}

export const Card = ({
    children,
    title,
    subtitle,
    actions,
    onClick,
    className = "",
}: CardProps) => {
    return (
        <div
            className={`bg-white rounded-lg shadow p-6 ${
                onClick ? "cursor-pointer hover:shadow-lg transition" : ""
            } ${className}`}
            onClick={onClick}
        >
            {(title || actions) && (
                <div className="flex items-start justify-between mb-4">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-600 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && <div className="flex-shrink-0">{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
};
