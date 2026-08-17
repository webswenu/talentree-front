import type { ImpactoBorrado } from "../../services/companies.service";

interface Props {
    /** Lo que se va a eliminar, en palabras: "la empresa X", "el proceso Y". */
    queSeElimina: string;
    impacto?: ImpactoBorrado;
    cargando?: boolean;
}

/**
 * Advertencia previa a un borrado irreversible.
 *
 * Eliminar una empresa o un proceso ahora SÍ es posible (antes se bloqueaba),
 * pero se lleva por delante las postulaciones, las respuestas de los tests y
 * los informes psicotécnicos de personas reales. Un "esta acción no se puede
 * deshacer" genérico no alcanza: hay que decir cuánto y de quiénes.
 *
 * Solo se enumera lo que existe. Si el proceso no tiene candidatos, no tiene
 * sentido mencionarlos.
 */
export const AvisoBorrado = ({ queSeElimina, impacto, cargando }: Props) => {
    if (cargando) {
        return (
            <p className="text-gray-600">
                Revisando qué datos dependen de {queSeElimina}…
            </p>
        );
    }

    const partidas: Array<{ n: number; texto: string }> = impacto
        ? [
              { n: impacto.procesos, texto: impacto.procesos === 1 ? "proceso de selección" : "procesos de selección" },
              { n: impacto.postulaciones, texto: impacto.postulaciones === 1 ? "postulación" : "postulaciones" },
              { n: impacto.respuestasDeTest, texto: impacto.respuestasDeTest === 1 ? "test rendido" : "tests rendidos" },
              { n: impacto.informes, texto: impacto.informes === 1 ? "informe" : "informes" },
              { n: impacto.invitaciones, texto: impacto.invitaciones === 1 ? "invitación enviada" : "invitaciones enviadas" },
          ].filter((x) => x.n > 0)
        : [];

    // Nada que arrastrar: la confirmación puede ser simple.
    if (partidas.length === 0) {
        return (
            <p className="text-gray-700">
                Vas a eliminar {queSeElimina}. No hay ningún dato asociado que
                se pierda, pero la acción no se puede deshacer.
            </p>
        );
    }

    const candidatos = impacto?.candidatosAfectados ?? 0;

    return (
        <div className="space-y-3">
            <p className="text-gray-700">
                Vas a eliminar {queSeElimina}.{" "}
                <strong className="text-red-700">
                    Con esto se borra también:
                </strong>
            </p>

            <ul className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-1.5">
                {partidas.map((x) => (
                    <li key={x.texto} className="text-sm text-red-900">
                        <span className="font-bold tabular-nums">{x.n}</span>{" "}
                        {x.texto}
                    </li>
                ))}
            </ul>

            {candidatos > 0 && (
                <p className="text-sm text-gray-700">
                    Afecta a{" "}
                    <strong>
                        {candidatos}{" "}
                        {candidatos === 1 ? "candidato" : "candidatos"}
                    </strong>
                    {impacto && impacto.informes > 0
                        ? ", incluidos sus informes de evaluación."
                        : "."}
                </p>
            )}

            <p className="text-sm font-medium text-red-800">
                No se puede deshacer.
            </p>
        </div>
    );
};
