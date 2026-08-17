import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * P-57. El título de la pestaña era "Talentree - Reclutamiento de RRHH" en
 * TODAS las pantallas: en el panel, en el listado de procesos, en el detalle de
 * un proceso, en empresas, en tests y en las páginas públicas. Con varias
 * pestañas abiertas —que es justo como se trabaja en selección— no había forma
 * de distinguirlas.
 *
 * Se resuelve derivando el título de la ruta, sin tener que tocar las 40 y
 * tantas pantallas una por una.
 */

const MARCA = "Talentree";

/** Título por ruta. Las claves se comparan por prefijo, de más larga a más corta. */
const TITULOS: Record<string, string> = {
    "/admin/empresas": "Empresas",
    "/admin/procesos": "Procesos",
    "/admin/trabajadores": "Candidatos",
    "/admin/usuarios": "Usuarios",
    "/admin/tests": "Tests",
    "/admin/reportes": "Informes",
    "/admin/auditoria": "Auditoría",
    "/admin/configuracion": "Configuración",
    "/admin/perfil": "Mi perfil",
    "/admin": "Panel de administración",

    "/empresa/procesos": "Procesos",
    "/empresa/trabajadores": "Candidatos",
    "/empresa/reportes": "Informes",
    "/empresa/invitaciones": "Invitaciones",
    "/empresa/configuracion": "Configuración",
    "/empresa/perfil": "Mi perfil",
    "/empresa": "Panel de empresa",

    "/evaluador/empresas": "Empresas",
    "/evaluador/procesos": "Procesos",
    "/evaluador/trabajadores": "Candidatos",
    "/evaluador/tests": "Tests",
    "/evaluador/reportes": "Informes",
    "/evaluador/revisar": "Revisar evaluación",
    "/evaluador/perfil": "Mi perfil",
    "/evaluador": "Panel de evaluador",

    "/trabajador/procesos": "Ofertas disponibles",
    "/trabajador/postulaciones": "Mis postulaciones",
    "/trabajador/resultados": "Mis resultados",
    "/trabajador/test": "Rindiendo test",
    "/trabajador/perfil": "Mi perfil",
    "/trabajador": "Mi panel",

    "/invitado/procesos": "Procesos",
    "/invitado/trabajadores": "Candidatos",
    "/invitado/reportes": "Informes",
    "/invitado/perfil": "Mi perfil",
    "/invitado": "Panel de invitado",

    "/oportunidades": "Oportunidades laborales",
    "/login": "Iniciar sesión",
    "/register": "Crear cuenta",
    "/terms": "Términos y condiciones",
    "/faq": "Preguntas frecuentes",
    "/unauthorized": "Sin acceso",
};

/** Las claves más específicas primero, para que /admin no gane sobre /admin/procesos. */
const CLAVES = Object.keys(TITULOS).sort((a, b) => b.length - a.length);

export function useDocumentTitle(titulo?: string): void {
    const { pathname } = useLocation();

    useEffect(() => {
        // Un título explícito manda: sirve para las pantallas de detalle, que
        // pueden poner el nombre del proceso o del candidato.
        if (titulo) {
            document.title = `${titulo} - ${MARCA}`;
            return;
        }

        const clave = CLAVES.find(
            (k) => pathname === k || pathname.startsWith(k + "/")
        );

        document.title = clave
            ? `${TITULOS[clave]} - ${MARCA}`
            : `${MARCA} - Reclutamiento de RRHH`;
    }, [pathname, titulo]);
}
