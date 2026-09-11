import { describe, it, expect } from "vitest";
import { limpiarOpcionales } from "./registro";

/**
 * R-01 y R-02.
 *
 * El formulario inicializa todos los campos en cadena vacía y enviaba el
 * objeto entero. `@IsOptional()` del backend solo salta `undefined` y `null`,
 * así que `""` entraba al validador y fallaba: quien dejaba en blanco
 * «Teléfono (opcional)» o la fecha de nacimiento no podía registrarse.
 */
describe("limpiarOpcionales", () => {
    it("omite los campos que quedaron en blanco", () => {
        const enviado = limpiarOpcionales({
            email: "candidata@ejemplo.cl",
            phone: "",
            birthDate: "",
            address: "",
        });

        expect(enviado).toEqual({ email: "candidata@ejemplo.cl" });
        expect("phone" in enviado).toBe(false);
        expect("birthDate" in enviado).toBe(false);
    });

    it("omite también los que traen solo espacios", () => {
        expect(limpiarOpcionales({ city: "   ", region: "\t" })).toEqual({});
    });

    it("recorta los que sí tienen contenido", () => {
        expect(limpiarOpcionales({ firstName: "  Paulina  " })).toEqual({
            firstName: "Paulina",
        });
    });

    it("no toca los valores que no son texto", () => {
        expect(
            limpiarOpcionales({ skills: ["grúa"], activo: false, cupos: 0 })
        ).toEqual({ skills: ["grúa"], activo: false, cupos: 0 });
    });

    it("descarta null y undefined", () => {
        expect(limpiarOpcionales({ a: null, b: undefined, c: "x" })).toEqual({
            c: "x",
        });
    });

    it("deja el formulario de registro completo tal como se espera", () => {
        // Exactamente el objeto que arma RegisterWorkerPage cuando la persona
        // llena solo lo obligatorio y salta el paso 3 entero.
        const formulario = {
            email: "candidata@ejemplo.cl",
            password: "Talento2026",
            firstName: "Paulina",
            lastName: "Riquelme",
            rut: "15678234-3",
            phone: "",
            birthDate: "",
            address: "",
            city: "",
            region: "",
            education: "",
            experience: "",
        };

        expect(Object.keys(limpiarOpcionales(formulario)).sort()).toEqual([
            "email",
            "firstName",
            "lastName",
            "password",
            "rut",
        ]);
    });
});
