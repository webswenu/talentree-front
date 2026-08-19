import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // No se le avisa a la persona: esto corre al montar el hook, no nace de una acción suya y ya hay un valor inicial de respaldo.
            console.warn(
                `No se pudo leer "${key}" desde localStorage; se usa el valor inicial.`,
                error
            );
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // No se le avisa a la persona: es plomería interna (cuota o modo privado del navegador) y el valor ya quedó aplicado en memoria.
            console.warn(`No se pudo guardar "${key}" en localStorage.`, error);
        }
    };

    const removeValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            // No se le avisa a la persona: es plomería interna del navegador y no hay nada que ella pueda hacer al respecto.
            console.warn(`No se pudo borrar "${key}" de localStorage.`, error);
        }
    };

    return [storedValue, setValue, removeValue] as const;
}
