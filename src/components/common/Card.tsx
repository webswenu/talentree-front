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
            className={`glass-white rounded-2xl p-6 transition-all duration-300 ${
                onClick ? "cursor-pointer hover:scale-105 hover:shadow-2xl" : "hover:shadow-xl"
            } ${className}`}
            onClick={onClick}
        >
            {(title || actions) && (
                <div className="flex items-start justify-between mb-6">
                    <div>
                        {title && (
                            <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600/70 to-secondary-600/70 bg-clip-text text-transparent">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-600 mt-2 font-medium">
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
