import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useModalBehavior } from "../../hooks/useModalBehavior";

interface Props {
    children: ReactNode;
    /**
     * Al pasarlo, el diálogo se cierra con Escape (P-07).
     * Es opcional para no romper los modales que ya usaban este componente.
     */
    onClose?: () => void;
    /** Desactiva el bloqueo de scroll del fondo en casos puntuales. */
    lockScroll?: boolean;
}

/**
 * Monta el contenido directamente en <body> y le da el comportamiento que se
 * espera de un diálogo.
 *
 * POSICIONAMIENTO (D-01, el defecto que reportó la clienta):
 * Los modales usan "fixed inset-0" para cubrir la pantalla, pero un elemento
 * position: fixed se mide contra el viewport SOLO si ninguno de sus ancestros
 * tiene transform, filter o perspective. Cualquiera de esos valores convierte
 * al ancestro en el bloque contenedor y el modal pasa a medirse contra él.
 *
 * Los contenedores de página usan animaciones que aplican transform mientras
 * corren, así que un modal montado dentro del árbol de la página queda mal
 * posicionado (fuera de pantalla) durante ese lapso. Sacándolo a <body> el
 * modal queda inmune a lo que haga cualquier contenedor de la aplicación.
 * Resuelve de paso D-02: el overflow-hidden de los cinco layouts ya no puede
 * recortarlo, porque el modal deja de estar dentro de ellos.
 *
 * COMPORTAMIENTO (P-07):
 * Bloqueo del scroll de fondo, cierre con Escape, foco atrapado dentro del
 * diálogo y foco devuelto al cerrar. Vive aquí para que cualquier modal lo
 * herede con solo envolverse.
 */
export const ModalPortal = ({ children, onClose, lockScroll = true }: Props) => {
    const contenedorRef = useModalBehavior<HTMLDivElement>({
        onClose,
        lockScroll,
    });

    if (typeof document === "undefined") return null;

    return createPortal(
        <div ref={contenedorRef} role="dialog" aria-modal="true">
            {children}
        </div>,
        document.body
    );
};
