import { Navbar } from "../../components/public/Navbar";
import { Footer } from "../../components/public/Footer";

export const TermsPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 py-52">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        Términos y Condiciones
                    </h1>

                    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                1. Aceptación de los Términos
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Al acceder y utilizar la plataforma Talentree, usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no deberá utilizar nuestros servicios.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                2. Descripción del Servicio
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Talentree es una plataforma digital que conecta empresas del sector minero con profesionales calificados. Nuestros servicios incluyen:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Publicación y gestión de oportunidades laborales</li>
                                <li>Herramientas de evaluación psicotécnica</li>
                                <li>Gestión de procesos de selección</li>
                                <li>Almacenamiento y gestión de perfiles de candidatos</li>
                                <li>Sistema de videos introductorios</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                3. Registro y Cuentas de Usuario
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Para utilizar nuestros servicios, los usuarios deben:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Proporcionar información verdadera, precisa y completa durante el registro</li>
                                <li>Mantener actualizada su información de perfil</li>
                                <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                                <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                                <li>Ser mayor de 18 años o tener el consentimiento de un tutor legal</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                4. Uso Aceptable
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Los usuarios se comprometen a NO:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Publicar información falsa o engañosa</li>
                                <li>Utilizar la plataforma para fines ilegales o no autorizados</li>
                                <li>Interferir con el funcionamiento de la plataforma</li>
                                <li>Acceder a cuentas de otros usuarios sin autorización</li>
                                <li>Enviar spam o contenido no solicitado</li>
                                <li>Discriminar por motivos de raza, género, religión, orientación sexual u otros factores protegidos por ley</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                5. Propiedad Intelectual
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Todos los contenidos de la plataforma, incluyendo pero no limitado a textos, gráficos, logos, iconos, imágenes, clips de audio y software, son propiedad de Talentree o sus licenciantes y están protegidos por las leyes de propiedad intelectual de Chile y tratados internacionales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                6. Privacidad y Protección de Datos
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                El tratamiento de sus datos personales se rige por nuestra Política de Privacidad, que cumple con la Ley N° 19.628 sobre Protección de la Vida Privada de Chile. Al utilizar nuestros servicios, usted consiente la recopilación, uso y divulgación de su información personal según lo descrito en dicha política.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                7. Evaluaciones y Tests Psicotécnicos
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Los tests y evaluaciones disponibles en la plataforma:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Son herramientas de apoyo al proceso de selección</li>
                                <li>Deben ser completados por el candidato personalmente</li>
                                <li>Los resultados son confidenciales y solo accesibles por el candidato y las empresas autorizadas</li>
                                <li>No garantizan ni determinan automáticamente la contratación</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                8. Videos Introductorios
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Respecto a los videos introductorios:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>El candidato otorga permiso para grabar y almacenar su video</li>
                                <li>Los videos serán utilizados exclusivamente para procesos de selección</li>
                                <li>El contenido debe ser profesional y respetuoso</li>
                                <li>Talentree se reserva el derecho de eliminar videos inapropiados</li>
                                <li>Los candidatos pueden solicitar la eliminación de sus videos en cualquier momento</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                9. Planes y Pagos
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Para empresas que contraten planes de pago:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Los precios están expresados en pesos chilenos (CLP) más IVA</li>
                                <li>Los pagos se procesarán mensual o anualmente según el plan seleccionado</li>
                                <li>La renovación es automática salvo cancelación previa</li>
                                <li>No se realizan reembolsos por periodos no utilizados</li>
                                <li>Talentree se reserva el derecho de modificar los precios con 30 días de anticipación</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                10. Suspensión y Terminación
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Talentree se reserva el derecho de suspender o terminar el acceso de cualquier usuario que viole estos Términos y Condiciones, sin previo aviso y sin responsabilidad alguna. El usuario también puede cancelar su cuenta en cualquier momento desde la configuración de su perfil.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                11. Limitación de Responsabilidad
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Talentree no será responsable por:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Decisiones de contratación tomadas por las empresas</li>
                                <li>La veracidad de la información proporcionada por usuarios</li>
                                <li>Daños indirectos, incidentales o consecuentes derivados del uso de la plataforma</li>
                                <li>Interrupciones temporales del servicio por mantenimiento o causas de fuerza mayor</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                12. Modificaciones a los Términos
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Talentree se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma. El uso continuado de los servicios después de dichas modificaciones constituye la aceptación de los nuevos términos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                13. Ley Aplicable y Jurisdicción
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de la República de Chile. Cualquier disputa que surja en relación con estos términos será sometida a la jurisdicción exclusiva de los tribunales ordinarios de justicia de Santiago de Chile.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                14. Contacto
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Para consultas sobre estos Términos y Condiciones, puede contactarnos a través de:
                            </p>
                            <div className="mt-3 text-gray-700">
                                
                                <p>Teléfono: +56 9 6371 7583</p>
                            </div>
                        </section>

                        <div className="border-t pt-6 mt-8">
                            <p className="text-sm text-gray-500 text-center">
                                Última actualización: Noviembre 2024
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
