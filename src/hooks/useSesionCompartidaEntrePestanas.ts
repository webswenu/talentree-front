import { useEffect } from "react";

/**
 * Mantiene coherentes las pestañas del mismo navegador.
 *
 * AUT-12, verificado en producción el 19-08-2026. `localStorage` es compartido
 * por origen, así que iniciar sesión en una segunda pestaña **pisa** la sesión
 * de la primera. La primera seguía con su usuario en memoria —su menú, sus
 * pantallas, su rol— pero mandaba el token nuevo en cada petición.
 *
 * El resultado medido: una pestaña con la interfaz de Invitado, que debe ver 1
 * candidato, mostraba los 16 del sistema porque el token era el de otra cuenta.
 * Interfaz de un rol con los datos de otro, sin ninguna señal de que algo
 * cambió.
 *
 * El navegador ya avisa de esto: el evento `storage` se dispara en las OTRAS
 * pestañas cuando una cambia `localStorage`. Al detectar que la sesión guardada
 * dejó de ser la nuestra, se recarga: la aplicación vuelve a leer la sesión que
 * de verdad está activa y se dibuja con el rol correcto.
 *
 * Se recarga en vez de intentar re-sincronizar el estado en caliente porque las
 * consultas ya cacheadas son del usuario anterior; una recarga las descarta
 * todas de una vez y no deja nada a medio camino.
 */
export const useSesionCompartidaEntrePestanas = () => {
    useEffect(() => {
        const alCambiarElAlmacenamiento = (evento: StorageEvent) => {
            // Solo interesan las claves de sesión, y solo los cambios hechos
            // por OTRA pestaña: los propios ya están reflejados en el estado.
            if (evento.key !== "accessToken" && evento.key !== "user") return;
            if (evento.newValue === evento.oldValue) return;

            window.location.reload();
        };

        window.addEventListener("storage", alCambiarElAlmacenamiento);
        return () =>
            window.removeEventListener("storage", alCambiarElAlmacenamiento);
    }, []);
};
