import { describe, it, expect } from "vitest";
import {
    normalizarTelefono,
    mensajeDeTelefono,
    isValidPhone,
    mensajeDePassword,
    isStrongPassword,
    AYUDA_PASSWORD,
    AYUDA_TELEFONO,
} from "./validators";

/**
 * Estas reglas son el espejo de las del backend
 * (common/validators/telefono.validator.ts y password.validator.ts).
 *
 * La tabla de casos es DELIBERADAMENTE la misma que la de
 * register-worker.dto.spec.ts: el problema que se esta arreglando es
 * justamente que las dos reglas se escribieron por separado y divergieron.
 * Si alguien cambia una sola, este archivo o su gemelo se pone rojo.
 */

describe("teléfono · cómo lo escribe la gente", () => {
    // R-04. El navegador validaba sin espacios y enviaba con espacios.
    it.each([
        ["+56 9 1234 5678", "+56912345678"],
        ["+56912345678", "+56912345678"],
        ["+56-9-1234-5678", "+56912345678"],
        ["(+56) 9 1234 5678", "+56912345678"],
        ["0056 9 1234 5678", "+56912345678"],
        ["  +56 9 1234 5678  ", "+56912345678"],
    ])("normaliza %s a %s", (escrito, esperado) => {
        expect(normalizarTelefono(escrito)).toBe(esperado);
        expect(isValidPhone(escrito)).toBe(true);
    });

    it.each([
        "+54 9 11 2345 6789",
        "+1 415 555 0132",
        "+34 612 345 678",
        "+49 151 23456789",
    ])("acepta el prefijo de otros países: %s", (internacional) => {
        expect(mensajeDeTelefono(internacional)).toBeNull();
    });
});

describe("teléfono · lo que rechaza", () => {
    it("pide el prefijo del país, y lo dice", () => {
        const motivo = mensajeDeTelefono("912345678");
        expect(motivo).toContain("prefijo");
    });

    it("rechaza más de 15 dígitos, que es el máximo de E.164", () => {
        expect(mensajeDeTelefono("+1234567890123456")).not.toBeNull();
    });

    it("rechaza menos de 8 dígitos", () => {
        expect(mensajeDeTelefono("+5691234")).not.toBeNull();
    });

    it("rechaza texto libre", () => {
        expect(mensajeDeTelefono("no tengo")).not.toBeNull();
    });

    // R-01. El campo se rotula «Teléfono (opcional)».
    it("acepta el campo vacío, porque es opcional", () => {
        expect(mensajeDeTelefono("")).toBeNull();
        expect(mensajeDeTelefono("   ")).toBeNull();
    });
});

describe("contraseña · la misma regla que el servidor", () => {
    // R-03. El paso 1 prometía 6 caracteres.
    it("rechaza la contraseña que el paso 1 daba por buena", () => {
        expect(mensajeDePassword("abc123")).toContain("8 caracteres");
    });

    it("exige al menos una mayúscula (D-3)", () => {
        expect(mensajeDePassword("candidata1")).toContain("mayúscula");
    });

    it("exige al menos un número", () => {
        expect(mensajeDePassword("Candidataa")).toContain("número");
    });

    it("exige al menos una letra", () => {
        expect(mensajeDePassword("12345678!")).toContain("letra");
    });

    it("rechaza las contraseñas más comunes", () => {
        expect(mensajeDePassword("12345678")).not.toBeNull();
        // La comparación es en minúscula a propósito: capitalizar una clave
        // común no la vuelve segura.
        expect(mensajeDePassword("Password1")).toContain("común");
        expect(mensajeDePassword("Abc12345")).toContain("común");
    });

    it("acepta una contraseña que cumple", () => {
        expect(mensajeDePassword("Talento2026")).toBeNull();
        expect(isStrongPassword("Talento2026")).toBe(true);
    });
});

describe("los textos de ayuda dicen la regla verdadera", () => {
    /**
     * R-03 otra vez, por el otro lado: el placeholder decía «Mínimo 6
     * caracteres» mientras la API exigía ocho. Si alguien cambia la regla y se
     * olvida del texto, esto se pone rojo.
     */
    it("el texto de la contraseña coincide con lo que se exige", () => {
        const largoMinimo = Number(AYUDA_PASSWORD.match(/\d+/)?.[0]);
        expect(largoMinimo).toBeGreaterThan(0);

        const unoMenos = "A1" + "a".repeat(largoMinimo - 3);
        expect(unoMenos).toHaveLength(largoMinimo - 1);
        expect(mensajeDePassword(unoMenos)).not.toBeNull();

        const justo = "A1" + "a".repeat(largoMinimo - 2);
        expect(mensajeDePassword(justo)).toBeNull();

        expect(AYUDA_PASSWORD.toLowerCase()).toContain("mayúscula");
        expect(AYUDA_PASSWORD.toLowerCase()).toContain("número");
    });

    it("el texto del teléfono muestra un ejemplo que de verdad se acepta", () => {
        const ejemplo = AYUDA_TELEFONO.match(/\+[\d\s]+/)?.[0]?.trim();
        expect(ejemplo).toBeTruthy();
        expect(mensajeDeTelefono(ejemplo as string)).toBeNull();
    });
});
