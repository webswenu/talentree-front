import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * El mensaje del toast puede traer texto que viene del servidor (mensajes de
 * error que repiten lo que escribió la persona). Antes se metía con innerHTML
 * y un "<img onerror=...>" se ejecutaba (XSS). Ahora va como texto.
 *
 * No hay jsdom en el proyecto: se usa un document mínimo que registra lo que
 * se le asigna a cada nodo.
 */
interface NodoFalso {
    tag: string;
    children: NodoFalso[];
    textContent: string;
    innerHTMLAsignado: string | null;
    style: Record<string, string>;
    className: string;
    id: string;
    parentNode: NodoFalso | null;
    appendChild(n: NodoFalso): NodoFalso;
    removeChild(n: NodoFalso): NodoFalso;
}

const crearNodo = (tag: string): NodoFalso => {
    const nodo: NodoFalso = {
        tag,
        children: [],
        textContent: "",
        innerHTMLAsignado: null,
        style: {},
        className: "",
        id: "",
        parentNode: null,
        appendChild(n) {
            n.parentNode = nodo;
            nodo.children.push(n);
            return n;
        },
        removeChild(n) {
            nodo.children = nodo.children.filter((c) => c !== n);
            return n;
        },
    };
    Object.defineProperty(nodo, "innerHTML", {
        set(v: string) {
            nodo.innerHTMLAsignado = v;
        },
    });
    return nodo;
};

const textoDe = (n: NodoFalso): string =>
    n.textContent + n.children.map(textoDe).join("");

describe("toast", () => {
    let body: NodoFalso;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.resetModules();
        body = crearNodo("body");
        vi.stubGlobal("document", {
            body,
            createElement: (tag: string) => crearNodo(tag),
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("muestra el mensaje como texto, nunca como HTML", async () => {
        const { toast } = await import("./toast");
        const malicioso = '<img src=x onerror="alert(1)">';

        toast.error(malicioso);

        const contenedor = body.children[0];
        const aviso = contenedor.children[0];
        expect(aviso.innerHTMLAsignado).toBeNull();
        expect(textoDe(aviso)).toContain(malicioso);
    });
});
