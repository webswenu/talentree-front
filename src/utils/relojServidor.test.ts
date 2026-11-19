import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    ahoraServidor,
    hayHoraServidor,
    registrarHoraServidor,
    reiniciarRelojServidor,
} from "./relojServidor";

const HORA_SERVIDOR = Date.parse("2026-11-19T18:03:49.752Z");
const MIN = 60 * 1000;

describe("relojServidor", () => {
    beforeEach(() => {
        reiniciarRelojServidor();
        vi.useFakeTimers();
    });
    afterEach(() => vi.useRealTimers());

    it("sin muestras usa el reloj local y avisa que no hay hora del servidor", () => {
        vi.setSystemTime(HORA_SERVIDOR);
        expect(hayHoraServidor()).toBe(false);
        expect(ahoraServidor()).toBe(HORA_SERVIDOR);
    });

    it("corrige un PC adelantado (el caso del 19-11-2026)", () => {
        // El PC va 3 horas adelantado; el servidor responde a mitad de camino.
        const local = HORA_SERVIDOR + 3 * 60 * MIN;
        vi.setSystemTime(local + 200);
        registrarHoraServidor(new Date(HORA_SERVIDOR + 100).toISOString(), local, local + 200);

        expect(hayHoraServidor()).toBe(true);
        expect(ahoraServidor()).toBe(HORA_SERVIDOR + 200);

        // Un DISC (15 min) recién empezado no está vencido.
        const startedAt = HORA_SERVIDOR;
        expect(ahoraServidor() - startedAt).toBeLessThan(15 * MIN);
    });

    it("corrige un PC atrasado", () => {
        const local = HORA_SERVIDOR - 20 * MIN;
        vi.setSystemTime(local);
        registrarHoraServidor(new Date(HORA_SERVIDOR).toISOString(), local, local);
        expect(ahoraServidor()).toBe(HORA_SERVIDOR);
    });

    it("se queda con la muestra de menor ida y vuelta", () => {
        const local = HORA_SERVIDOR;
        vi.setSystemTime(local);
        registrarHoraServidor(new Date(HORA_SERVIDOR).toISOString(), local, local + 40);
        // Muestra lenta y desplazada: se ignora.
        registrarHoraServidor(new Date(HORA_SERVIDOR + 5000).toISOString(), local, local + 4000);
        // Desfase = servidor - (envío + 20 ms) = -20 ms.
        expect(ahoraServidor()).toBe(local - 20);
    });

    it("ignora timestamps inválidos", () => {
        registrarHoraServidor(undefined, 1, 2);
        registrarHoraServidor("no es fecha", 1, 2);
        expect(hayHoraServidor()).toBe(false);
    });
});
