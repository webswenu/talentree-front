import { useEffect, useRef } from "react";

/**
 * Comportamiento común de todos los diálogos (hallazgo P-07 / D-07).
 *
 * El QA encontró que NINGUNO de los 22 modales de la aplicación:
 *  - bloqueaba el scroll del fondo (en mobile el contenido se sigue moviendo
 *    bajo el dedo mientras el popup está abierto, y al cerrarlo la página
 *    quedó en otra posición),
 *  - se cerraba con Escape,
 *  - atrapaba el foco (con el teclado se puede tabular "fuera" del diálogo,
 *    hacia los controles del fondo, que no se ven ni se sabe dónde están).
 *
 * Está todo aquí y no repetido en cada modal para que adoptarlo sea gratis.
 */

/**
 * Cuántos diálogos hay abiertos.
 *
 * Hace falta contar: si se abre un modal sobre otro (por ejemplo el de
 * confirmación de borrado sobre el de edición), al cerrar el de arriba se
 * restauraría el scroll del body aunque el de abajo siga abierto.
 */
let abiertos = 0;
let overflowOriginal = "";
let paddingOriginal = "";

function bloquearScroll(): void {
    if (abiertos === 0) {
        const { body } = document;
        overflowOriginal = body.style.overflow;
        paddingOriginal = body.style.paddingRight;

        // Al ocultar la barra de scroll el contenido se corre hacia la derecha
        // y la página "salta". Se compensa con un relleno del mismo ancho.
        const anchoBarra = window.innerWidth - document.documentElement.clientWidth;
        if (anchoBarra > 0) {
            body.style.paddingRight = `${anchoBarra}px`;
        }

        body.style.overflow = "hidden";
    }
    abiertos++;
}

function liberarScroll(): void {
    abiertos = Math.max(0, abiertos - 1);

    if (abiertos === 0) {
        document.body.style.overflow = overflowOriginal;
        document.body.style.paddingRight = paddingOriginal;
    }
}

const FOCOTABLES = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

interface Opciones {
    /** Se llama al presionar Escape. Si no se pasa, Escape no cierra. */
    onClose?: () => void;
    /** Permite desactivar el bloqueo de scroll en casos puntuales. */
    lockScroll?: boolean;
}

export function useModalBehavior<T extends HTMLElement>({
    onClose,
    lockScroll = true,
}: Opciones = {}) {
    const contenedorRef = useRef<T | null>(null);

    useEffect(() => {
        if (lockScroll) bloquearScroll();

        // Para devolver el foco a donde estaba al cerrar: si no, quien navega
        // con teclado vuelve al principio de la página cada vez.
        const focoPrevio = document.activeElement as HTMLElement | null;

        // El primer control del diálogo recibe el foco al abrirse.
        const primerFoco = window.setTimeout(() => {
            const enfocables =
                contenedorRef.current?.querySelectorAll<HTMLElement>(FOCOTABLES);
            enfocables?.[0]?.focus();
        }, 0);

        const alPresionarTecla = (evento: KeyboardEvent) => {
            if (evento.key === "Escape" && onClose) {
                evento.stopPropagation();
                onClose();
                return;
            }

            if (evento.key !== "Tab" || !contenedorRef.current) return;

            const enfocables = Array.from(
                contenedorRef.current.querySelectorAll<HTMLElement>(FOCOTABLES)
            ).filter((el) => el.offsetParent !== null);

            if (enfocables.length === 0) return;

            const primero = enfocables[0];
            const ultimo = enfocables[enfocables.length - 1];
            const activo = document.activeElement;

            // El ciclo se cierra sobre sí mismo: del último se vuelve al
            // primero y viceversa, sin salir nunca al contenido de fondo.
            if (evento.shiftKey && activo === primero) {
                evento.preventDefault();
                ultimo.focus();
            } else if (!evento.shiftKey && activo === ultimo) {
                evento.preventDefault();
                primero.focus();
            }
        };

        document.addEventListener("keydown", alPresionarTecla);

        return () => {
            window.clearTimeout(primerFoco);
            document.removeEventListener("keydown", alPresionarTecla);
            if (lockScroll) liberarScroll();
            focoPrevio?.focus?.();
        };
    }, [onClose, lockScroll]);

    return contenedorRef;
}
