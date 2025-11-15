import {
    InputHTMLAttributes,
    TextareaHTMLAttributes,
    SelectHTMLAttributes,
} from "react";

interface BaseFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    helperText?: string;
}

interface InputFieldProps
    extends BaseFieldProps,
        InputHTMLAttributes<HTMLInputElement> {
    type?:
        | "text"
        | "email"
        | "password"
        | "number"
        | "tel"
        | "url"
        | "date"
        | "time"
        | "datetime-local";
}

interface TextareaFieldProps
    extends BaseFieldProps,
        TextareaHTMLAttributes<HTMLTextAreaElement> {}

interface SelectFieldProps
    extends BaseFieldProps,
        SelectHTMLAttributes<HTMLSelectElement> {
    options: Array<{ value: string | number; label: string }>;
}

export const InputField = ({
    label,
    error,
    required,
    helperText,
    className = "",
    ...props
}: InputFieldProps) => {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                {...props}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    error ? "border-red-500" : "border-gray-300"
                } ${className}`}
            />
            {helperText && !error && (
                <p className="text-sm text-gray-500">{helperText}</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
};

export const TextareaField = ({
    label,
    error,
    required,
    helperText,
    className = "",
    rows = 4,
    ...props
}: TextareaFieldProps) => {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
                {...props}
                rows={rows}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
                    error ? "border-red-500" : "border-gray-300"
                } ${className}`}
            />
            {helperText && !error && (
                <p className="text-sm text-gray-500">{helperText}</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
};

export const SelectField = ({
    label,
    error,
    required,
    helperText,
    options,
    className = "",
    ...props
}: SelectFieldProps) => {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                {...props}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    error ? "border-red-500" : "border-gray-300"
                } ${className}`}
            >
                <option value="">Seleccione una opción</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {helperText && !error && (
                <p className="text-sm text-gray-500">{helperText}</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
};

export const CheckboxField = ({
    label,
    error,
    className = "",
    ...props
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <div className="space-y-1">
            <label className="flex items-center space-x-2 cursor-pointer">
                <input
                    {...props}
                    type="checkbox"
                    className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${className}`}
                />
                <span className="text-sm font-medium text-gray-700">
                    {label}
                </span>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
};

export const RadioField = ({
    label,
    error,
    options,
    name,
    value,
    onChange,
}: BaseFieldProps & {
    options: Array<{ value: string; label: string }>;
    name: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="space-y-2">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="flex items-center space-x-2 cursor-pointer"
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={onChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
};
