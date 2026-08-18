import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { useCurrentUser } from "../../hooks/useAuth";
import { toast } from "../../utils/toast";
import { getApiErrorMessage } from "../../utils/apiError";

/**
 * Selector de empresa para quien representa a más de una.
 *
 * No se muestra nunca con una sola empresa: para la inmensa mayoría de los
 * representantes el control sería un desplegable de un solo elemento, que solo
 * agrega ruido y hace dudar de si falta algo por elegir.
 *
 * El aislamiento entre empresas no cambia por esto. La sesión sigue operando
 * sobre UNA empresa a la vez —la activa— y el backend valida en cada cambio que
 * la empresa elegida sea realmente de este usuario. Lo único que cambia
 * respecto del modelo anterior es quién la elige.
 */
export const CompanySwitcher = () => {
    const { user, setActiveCompany, setUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [isSwitching, setIsSwitching] = useState(false);

    /**
     * La sesión que hay en localStorage se escribió al iniciar sesión y no se
     * refresca nunca. Para quien ya estaba dentro cuando se habilitó el
     * multi-empresa, ese objeto no trae `companies`: le asignan una segunda
     * empresa y el selector no aparece hasta que cierre sesión, sin ninguna
     * pista de por qué.
     *
     * Se rehidrata una sola vez desde /auth/me (staleTime Infinity) y solo
     * cuando falta el dato, para no pedirle al servidor algo que ya se tiene.
     */
    const necesitaRefresco = !!user && user.companies === undefined;
    const { data: usuarioFresco } = useCurrentUser();

    useEffect(() => {
        if (necesitaRefresco && usuarioFresco) {
            setUser(usuarioFresco);
        }
    }, [necesitaRefresco, usuarioFresco, setUser]);

    const companies = user?.companies || [];

    if (companies.length < 2) return null;

    const activeId = user?.company?.id || "";

    const handleChange = async (companyId: string) => {
        if (!companyId || companyId === activeId) return;

        setIsSwitching(true);
        try {
            await setActiveCompany(companyId);

            /**
             * Todo lo cacheado —procesos, candidatos, informes, estadísticas—
             * es de la empresa anterior. Sin este vaciado, la pantalla sigue
             * mostrando los datos de la otra empresa hasta que cada consulta
             * decida recargarse por su cuenta: el usuario ve el nombre de una
             * empresa con los candidatos de la otra.
             */
            await queryClient.invalidateQueries();

            const elegida = companies.find((c) => c.id === companyId);
            toast.success(`Ahora estás operando en ${elegida?.name ?? "la empresa seleccionada"}`);
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, "No se pudo cambiar de empresa"));
        } finally {
            setIsSwitching(false);
        }
    };

    return (
        <div className="w-full mt-3">
            <label
                htmlFor="empresa-activa"
                className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1"
            >
                Empresa
            </label>
            <select
                id="empresa-activa"
                value={activeId}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isSwitching}
                className="w-full text-xs lg:text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-2 py-1.5 disabled:opacity-60"
            >
                {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                        {company.name}
                    </option>
                ))}
            </select>
            {isSwitching && (
                <p className="text-[11px] text-gray-500 mt-1">Cambiando…</p>
            )}
        </div>
    );
};
