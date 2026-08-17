import {
    InputHTMLAttributes,
    TextareaHTMLAttributes,
    SelectHTMLAttributes,
    useId,
} from "react";

/**
 * P-60. Las etiquetas no estaban asociadas a su campo: eran un <label> suelto
 * seguido de un <input>. Sin esa asociación, un lector de pantalla anuncia el
 * campo sin decir qué se espera en él, y hacer clic en el texto de la etiqueta
 * no enfoca el campo (que es el comportamiento que todo el mundo espera).
 *
 * Se resuelve con useId(), que genera un identificador único y estable por
 * instancia: no hay que inventarlos ni preocuparse por colisiones cuando el
 * mismo formulario se renderiza dos veces.
 */

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
    const idGenerado = useId();
    const id = props.id ?? idGenerado;
    const idError = `${id}-error`;

    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                {...props}
                id={id}
                aria-invalid={!!error}
                aria-describedby={error ? idError : undefined}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    error ? "border-red-500" : "border-gray-300"
                } ${className}`}
            />
            {helperText && !error && (
                <p className="text-sm text-gray-500">{helperText}</p>
            )}
            {error && (
                <p id={idError} className="text-sm text-red-600">
                    {error}
                </p>
            )}
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
    const idGenerado = useId();
    const id = props.id ?? idGenerado;
    const idError = `${id}-error`;

    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
                {...props}
                id={id}
                aria-invalid={!!error}
                aria-describedby={error ? idError : undefined}
                rows={rows}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
                    error ? "border-red-500" : "border-gray-300"
                } ${className}`}
            />
            {helperText && !error && (
                <p className="text-sm text-gray-500">{helperText}</p>
            )}
            {error && (
                <p id={idError} className="text-sm text-red-600">
                    {error}
                </p>
            )}
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
    const idGenerado = useId();
    const id = props.id ?? idGenerado;
    const idError = `${id}-error`;

    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                {...props}
                id={id}
                aria-invalid={!!error}
                aria-describedby={error ? idError : undefined}
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
            {error && (
                <p id={idError} className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

export const CheckboxField = ({
    label,
    error,
    className = "",
    ...props
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) => {
    // El control va dentro del <label>, que ya es una asociación válida.
    // El id solo hace falta para enlazar el mensaje de error.
    const idError = `${useId()}-error`;

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
            {error && (
                <p id={idError} className="text-sm text-red-600">
                    {error}
                </p>
            )}
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
    // Cada opción va dentro de su <label>, así que la asociación ya es válida.
    const idError = `${useId()}-error`;

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
            {error && (
                <p id={idError} className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};
