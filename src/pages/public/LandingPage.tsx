import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { Navbar } from "../../components/public/Navbar";
import { Footer } from "../../components/public/Footer";

export const LandingPage = () => {
    
    const about = useScrollAnimation();
    const services = useScrollAnimation();
    const testimonials = useScrollAnimation();
    const contact = useScrollAnimation();

    return (
        <div className="font-sans text-gray-800">
            {/* ====== NAVBAR ====== */}
            <Navbar />

            {/* ====== HERO ====== */}
            <section id="home" className="pt-52 md:pt-48 pb-8 md:pb-20 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2 animate-slide-up">
                        <h1 className="text-5xl font-bold mb-6">
                            <span className="text-teal-500">Impulsa </span>
                            tu Reclutamiento <span className="text-gray-700">con Tecnología Inteligente</span>
                        </h1>
                        <p className="text-gray-500 mb-6 leading-relaxed text-justify">
                            Optimiza cada etapa del proceso de selección con una herramienta diseñada para simplificar el trabajo de tu equipo y ofrecer una experiencia moderna y fluida a tus candidatos. Desde la filtración inicial hasta la decisión final, centraliza todo en un solo lugar.
                        </p>
                        <div className="flex gap-4">
                            <button className="border border-gray-400 px-6 py-3 rounded-full hover:bg-gray-100 hover:scale-105 transition-all duration-300">
                                Saber más
                            </button>
                            <button className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 hover:scale-105 transition-all duration-300">
                                Comienza aquí →
                            </button>
                        </div>
                    </div>

                    <div className="md:w-1/2 relative animate-slide-up delay-200">
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-400 rounded-full blur-3xl opacity-50 animate-float"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-400 rounded-full blur-3xl opacity-50 animate-float delay-3s"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
                            <img
                                src="/herosection.jpg"
                                alt="Reunión"
                                className="rounded-2xl hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== QUIÉNES SOMOS ====== */}
            <section
                ref={about.ref}
                id="about"
                className="py-24 bg-gray-50 overflow-hidden"
            >
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    {/* Imagen */}
                    <div className={`md:w-1/2 relative animate-on-scroll ${about.isVisible ? 'visible' : ''}`}>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-400 rounded-full blur-3xl opacity-40 animate-float"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400 rounded-full blur-3xl opacity-40 animate-float delay-2s"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
                            <img
                                src="cta.jpg"
                                alt="Equipo Talentree"
                                className="rounded-2xl hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>

                    {/* Texto */}
                    <div
                        className={`md:w-1/2 animate-on-scroll ${about.isVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: '200ms' }}
                    >
                        <h2 className="text-4xl font-bold mb-6">
                            <span className="text-teal-500">Quiénes </span>
                            <span className="text-gray-800">Somos</span>
                        </h2>
                        <p className="text-gray-600 mb-6 leading-relaxed text-justify">
                            En <strong>Talentree</strong> creemos en el poder
                            del talento como motor de crecimiento. Somos una
                            empresa especializada en soluciones de{" "}
                            <strong>
                                Reclutamiento y Selección Inteligente
                            </strong>
                            , enfocada en conectar a las personas adecuadas con
                            las oportunidades correctas.
                        </p>
                        <p className="text-gray-600 mb-6 leading-relaxed text-justify">
                            Combinamos experiencia en recursos humanos con análisis de datos y tecnología avanzada para ofrecer procesos más eficientes, objetivos y personalizados. Nuestro objetivo es simplificar la contratación y ayudarte a tomar decisiones basadas en información real y confiable.
                        </p>

                        <div className="flex gap-4">
                            <a
                                href="#services"
                                className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 hover:scale-105 transition-all duration-300"
                            >
                                Conoce nuestros servicios
                            </a>
                            <a
                                href="#contact"
                                className="border border-gray-400 px-6 py-3 rounded-full hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                            >
                                Contáctanos
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== PROPUESTA DE VALOR ====== */}
            <section
                ref={services.ref}
                id="services"
                className="py-24 bg-gray-50 overflow-hidden"
            >
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className={`text-3xl font-bold mb-3 animate-on-scroll ${services.isVisible ? 'visible' : ''}`}>
                        Propuesta de Valor
                    </h2>
                    <p
                        className={`text-gray-500 mb-12 text-justify md:text-center animate-on-scroll ${services.isVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: '100ms' }}
                    >
                        Conecta talento y oportunidades con procesos más simples, rápidos y basados en datos.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Tarjeta 1 - Automatización Inteligente */}
                        <div
                            className={`bg-white p-8 rounded-2xl shadow hover:shadow-xl transition-all duration-500 animate-on-scroll hover:-translate-y-2 ${services.isVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: '200ms' }}
                        >
                            <div className="bg-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform duration-300">
                                <span className="text-white text-3xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Automatización Inteligente
                            </h3>
                            <p className="text-gray-500 text-sm text-justify">
                                Ahorra tiempo con filtros automáticos, gestión por etapas y recordatorios que mantienen el proceso avanzando sin esfuerzo.
                            </p>
                        </div>

                        {/* Tarjeta 2 - Evaluaciones y Análisis en Profundidad */}
                        <div
                            className={`bg-white p-8 rounded-2xl shadow hover:shadow-xl transition-all duration-500 animate-on-scroll hover:-translate-y-2 ${services.isVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: '400ms' }}
                        >
                            <div className="bg-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform duration-300">
                                <span className="text-white text-3xl">📊</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Evaluaciones y Análisis en Profundidad
                            </h3>
                            <p className="text-gray-500 text-sm text-justify">
                                Aplica pruebas, entrevistas estructuradas y herramientas de evaluación para identificar rápidamente a los candidatos más adecuados.
                            </p>
                        </div>

                        {/* Tarjeta 3 - Datos en Tiempo Real */}
                        <div
                            className={`bg-white p-8 rounded-2xl shadow hover:shadow-xl transition-all duration-500 animate-on-scroll hover:-translate-y-2 ${services.isVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: '600ms' }}
                        >
                            <div className="bg-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform duration-300">
                                <span className="text-white text-3xl">📈</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Datos en Tiempo Real
                            </h3>
                            <p className="text-gray-500 text-sm text-justify">
                                Accede a reportes claros y métricas actualizadas que te permiten tomar decisiones objetivas y reducir errores de contratación.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== TESTIMONIOS ====== */}
            <section
                ref={testimonials.ref}
                className="py-20 bg-white text-center overflow-hidden"
            >
                <h2 className={`text-3xl font-bold mb-8 animate-on-scroll ${testimonials.isVisible ? 'visible' : ''}`}>
                    Testimonios
                </h2>
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-6">
                    <div
                        className={`bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 animate-on-scroll hover:-translate-y-2 ${testimonials.isVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: '100ms' }}
                    >
                        <p className="text-gray-500 mb-6 italic text-justify">
                            "Amet minim mollit non deserunt ullamco est sit
                            aliqua dolor do amet sint."
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <img
                                src="testimonio.jpg"
                                alt="Autor"
                                className="w-12 h-12 rounded-full hover:scale-110 transition-transform duration-300"
                            />
                            <div className="text-left">
                                <h4 className="font-semibold text-gray-800">
                                    Author Name
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Cargo/Profesión
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 animate-on-scroll hover:-translate-y-2 ${testimonials.isVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: '300ms' }}
                    >
                        <p className="text-gray-500 mb-6 italic text-justify">
                            "Amet minim mollit non deserunt ullamco est sit
                            aliqua dolor do amet sint."
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <img
                                src="testimonio.jpg"
                                alt="Autor"
                                className="w-12 h-12 rounded-full hover:scale-110 transition-transform duration-300"
                            />
                            <div className="text-left">
                                <h4 className="font-semibold text-gray-800">
                                    Author Name
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Cargo/Profesión
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== BANNER ====== */}
            <section className="relative bg-orange-100 py-20 text-white overflow-hidden">
                <img
                    src="cta2.jpg"
                    alt="Banner"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <div className="relative max-w-6xl mx-auto px-6 animate-fade-in">
                    <h2 className="text-4xl font-bold mb-4">Transforma tu Proceso de Contratación</h2>
                    <p className="text-lg max-w-xl text-justify">
                        Haz que tu equipo seleccione mejor, más rápido y con datos reales. Moderniza tu proceso con herramientas que automatizan, evalúan y conectan talento con oportunidades reales.
                    </p>
                    <button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full hover:scale-105 transition-all duration-300">
                        Agenda una demostración
                    </button>
                </div>
            </section>

            {/* ====== CONTACTO ====== */}
            <section
                ref={contact.ref}
                id="contact"
                className="py-20 bg-gradient-to-b from-white to-teal-50 overflow-hidden"
            >
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 px-6 items-start">
                    <div className={`animate-on-scroll ${contact.isVisible ? 'visible' : ''}`}>
                        <iframe
                            src="https://www.google.com/maps?q=santiago%20chile&output=embed"
                            className="w-full h-80 rounded-xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-500"
                        ></iframe>
                    </div>

                    <form
                        className={`bg-white shadow-xl rounded-2xl p-8 space-y-5 animate-on-scroll hover:shadow-2xl transition-shadow duration-500 ${contact.isVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: '200ms' }}
                    >
                        <h3 className="text-2xl font-bold mb-2">
                            Formulario de Contacto
                        </h3>
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                        />
                        <input
                            type="text"
                            placeholder="Teléfono"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                        />
                        <input
                            type="email"
                            placeholder="Correo"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                        />
                        <input
                            type="text"
                            placeholder="Asunto"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                        />
                        <button className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 hover:scale-105 transition-all duration-300 w-full">
                            Enviar
                        </button>
                    </form>
                </div>
            </section>

            {/* ====== FOOTER ====== */}
            <Footer />
        </div>
    );
};
