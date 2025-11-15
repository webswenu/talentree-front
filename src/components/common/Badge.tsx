interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger" | "info";
    color?: "gray" | "green" | "yellow" | "red" | "blue";
    size?: "sm" | "md" | "lg";
}

export const Badge = ({
    children,
    variant,
    color,
    size = "md",
}: BadgeProps) => {
    const variants = {
        default: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
    };

    const colorMap = {
        gray: "bg-gray-100 text-gray-800",
        green: "bg-green-100 text-green-800",
        yellow: "bg-yellow-100 text-yellow-800",
        red: "bg-red-100 text-red-800",
        blue: "bg-blue-100 text-blue-800",
    };

    const sizes = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-base px-3 py-1",
    };

    const colorClass = color
        ? colorMap[color]
        : variant
        ? variants[variant]
        : variants.default;

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizes[size]}`}
        >
            {children}
        </span>
    );
};
