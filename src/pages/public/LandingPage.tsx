import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { Navbar } from "../../components/public/Navbar";
import { Footer } from "../../components/public/Footer";
import { usePublicProcesses } from "../../hooks/useProcesses";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types/user.types";
import { useNavigate } from "react-router-dom";
import { workersService } from "../../services/workers.service";
import { contactService } from "../../services/contact.service";
import { getApiErrorMessage } from "../../utils/apiError";
import { useState } from "react";
import { toast } from "react-hot-toast";

const WHATSAPP_URL = "https://wa.me/56963717583";

/**
 * Servicios tal como los describe Talentree en su presentación comercial
 * (texto enviado por la clienta). Se listan sin adornos: es lo que hacen.
 */
const SERVICIOS = [
    {
        titulo: "Reclutamiento y selección",
        detalle: "Selección de personal por competencias, desde la publicación del cargo hasta la terna.",
    },
    {
        titulo: "Evaluaciones psicolaborales",
        detalle: "Para cargos operativos, profesionales, supervisores y ejecutivos.",
    },
    {
        titulo: "Assessment Center y potencial",
        detalle: "Evaluación de potencial y de competencias en ejercicios grupales e individuales.",
    },
    {
        titulo: "Evaluación y desarrollo de liderazgo",
        detalle: "Diagnóstico de líderes y planes de trabajo para desarrollar sus competencias.",
    },
    {
        titulo: "Desempeño y gestión por competencias",
        detalle: "Diseño y aplicación de evaluaciones de desempeño alineadas al modelo de la empresa.",
    },
    {
        titulo: "Perfiles y descriptores de cargo",
        detalle: "Definición de funciones, requisitos y competencias por cargo.",
    },
    {
        titulo: "Planes de desarrollo",
        detalle: "Planes de desarrollo individual y de equipos, con seguimiento.",
    },
    {
        titulo: "Talleres, charlas e intervenciones",
        detalle: "Intervenciones organizacionales diseñadas para cada equipo y contexto.",
    },
    {
        titulo: "Programas de formación",
        detalle: "Liderazgo, comunicación, trabajo colaborativo, seguridad psicológica, toma de decisiones y gestión del cambio.",
    },
];

const FOTOS = [
    {
        src: "/taller-liderazgo.jpg",
        alt: "Karina Rojas relatando un taller de liderazgo",
        caption: "Taller de liderazgo",
        portrait: true,
    },
    {
        src: "/karina-charla.jpg",
        alt: "Karina Rojas exponiendo frente a un grupo de trabajadores",
        caption: "Charla con equipos de trabajo",
        portrait: false,
    },
    {
        src: "/charla-cultura-preventiva.jpg",
        alt: "Karina Rojas en una charla sobre cultura preventiva",
        caption: "Charla sobre cultura preventiva",
        portrait: true,
    },
    {
        src: "/cierre-taller.jpg",
        alt: "Participantes al cierre de un taller",
        caption: "Cierre de jornada con participantes",
        portrait: false,
    },
];

export const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [applyingProcessId, setApplyingProcessId] = useState<string | null>(null);
    const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);
    const [contactForm, setContactForm] = useState({
        nombre: '',
        telefono: '',
        correo: '',
        asunto: ''
    });

    const what = useScrollAnimation();
    const about = useScrollAnimation();
    const services = useScrollAnimation();
    const gallery = useScrollAnimation();
    const processes = useScrollAnimation();
    const testimonials = useScrollAnimation();
    const contact = useScrollAnimation();

    const { data: processesData, isLoading: isLoadingProcesses } = usePublicProcesses({ page: 1, limit: 3 });
    const publicProcesses = processesData?.data || [];

    const handleApplyToProcess = async (processId: string) => {
        // Si no está logueado, redirigir a login con el processId como parámetro
        if (!user) {
            navigate(`/login?redirect=/&process=${processId}`);
            return;
        }

        // Si está logueado pero no es WORKER, mostrar error
        if (user.role !== UserRole.WORKER) {
            toast.error("Solo los trabajadores pueden postular a procesos");
            return;
        }

        // Si es WORKER, postular directamente
        if (!user.worker?.id) {
            toast.error("No se encontró tu perfil de trabajador");
            return;
        }

        try {
            setApplyingProcessId(processId);
            await workersService.applyToProcess({
                workerId: user.worker.id,
                processId: processId,
            });
            toast.success("¡Postulación exitosa! Puedes ver el estado en tu dashboard");
        } catch (error: any) {
            toast.error(getApiErrorMessage(error, "Error al postular al proceso"));
        } finally {
            setApplyingProcessId(null);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar que todos los campos estén llenos
        if (!contactForm.nombre || !contactForm.telefono || !contactForm.correo || !contactForm.asunto) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactForm.correo)) {
            toast.error("Por favor ingresa un correo válido");
            return;
        }

        try {
            setIsSubmittingContact(true);

            // Enviar formulario al backend
            const response = await contactService.sendContactForm(contactForm);

            // Mostrar mensaje de éxito
            toast.success(response.message);
            setContactFormSubmitted(true);

            // Limpiar formulario
            setContactForm({
                nombre: '',
                telefono: '',
                correo: '',
                asunto: ''
            });

            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                setContactFormSubmitted(false);
            }, 5000);
        } catch (error: any) {
            toast.error(getApiErrorMessage(error, "Error al enviar el mensaje. Por favor intenta nuevamente."));
        } finally {
            setIsSubmittingContact(false);
        }
    };

    return (
        <div className="font-sans text-gray-800">
            {/* ====== NAVBAR ====== */}
            <Navbar />

            {/* ====== HERO ====== */}
            {/* El navbar es fijo y mide ~184 px (logo de 160 px). El padding
                superior tiene que superarlo con holgura o el hero queda pegado
                al menú. */}
            <section id="home" className="pt-60 md:pt-72 pb-20 md:pb-28 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 lg:gap-16">
                    <div className="md:w-1/2 animate-slide-up">
                        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500 mb-3">
                            Consultora en Gestión de Personas
                        </p>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            <span className="text-teal-500">Evaluación, selección </span>
                            <span className="text-gray-700">y desarrollo de personas para tu organización</span>
                        </h1>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Talentree es una consultora especializada en Recursos Humanos y Desarrollo Organizacional.
                            Apoyamos a las áreas de Gestión de Personas como proveedor externo, con experiencia en
                            la industria minera y en empresas de servicios.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 hover:scale-105 transition-all duration-300 inline-block"
                            >
                                Conversemos →
                            </a>
                            <a
                                href="#services"
                                className="border border-gray-400 px-6 py-3 rounded-full hover:bg-gray-100 hover:scale-105 transition-all duration-300 inline-block"
                            >
                                Ver servicios
                            </a>
                        </div>
                    </div>

                    <div className="md:w-1/2 relative animate-slide-up delay-200">
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-400 rounded-full blur-3xl opacity-50 animate-float"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-400 rounded-full blur-3xl opacity-50 animate-float delay-3s"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
                            <img
                                src="/karina-charla.jpg"
                                alt="Karina Rojas, directora de Talentree, exponiendo frente a un grupo de trabajadores"
                                className="w-full h-auto rounded-2xl hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== QUÉ ES TALENTREE ====== */}
            <section
                ref={what.ref}
                id="what"
                className="py-20 bg-teal-500 text-white overflow-hidden"
            >
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className={`text-3xl font-bold mb-6 animate-on-scroll ${what.isVisible ? 'visible' : ''}`}>
                        Qué es Talentree
                    </h2>
                    <p
                        className={`text-lg leading-relaxed mb-10 text-teal-50 animate-on-scroll ${what.isVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: '100ms' }}
                    >
                        Una consultora de Recursos Humanos y Desarrollo Organizacional dirigida por
                        Karina Rojas, psicóloga organizacional. Evaluamos candidatos y trabajadores,
                        diseñamos perfiles de cargo y desarrollamos líderes y equipos. Las evaluaciones
                        se rinden en esta plataforma y la empresa revisa los resultados en el mismo lugar.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div
                            className={`bg-white/10 rounded-2xl p-6 animate-on-scroll ${what.isVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: '200ms' }}
                        >
                            <h3 className="font-semibold text-lg mb-2">Qué hacemos</h3>
                            <p className="text-teal-50 text-sm leading-relaxed">
                                Selección, evaluaciones psicolaborales, assessment, desempeño, perfiles de cargo, desarrollo de liderazgo y talleres.
                            </p>
                        </div>
                        <div
                            className={`bg-white/10 rounded-2xl p-6 animate-on-scroll ${what.isVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: '300ms' }}
                        >
                            <h3 className="font-semibold text-lg mb-2">Para quién</h3>
                            <p className="text-teal-50 text-sm leading-relaxed">
                                Áreas de Recursos Humanos y Gestión de Personas de operaciones mineras y empresas de servicios.
                            </p>
                        </div>
                        <div
                            className={`bg-white/10 rounded-2xl p-6 animate-on-scroll ${what.isVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: '400ms' }}
                        >
                            <h3 className="font-semibold text-lg mb-2">Cómo trabajamos</h3>
                            <p className="text-teal-50 text-sm leading-relaxed">
                                Como socio externo del área, con procesos ajustados a cada operación y resultados que se entregan a la empresa.
                            </p>
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
                    <div className={`md:w-5/12 relative animate-on-scroll ${about.isVisible ? 'visible' : ''}`}>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-400 rounded-full blur-3xl opacity-40 animate-float"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400 rounded-full blur-3xl opacity-40 animate-float delay-2s"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
                            <img
                                src="/charla-cultura-preventiva.jpg"
                                alt="Karina Rojas en una charla sobre cultura preventiva"
                                className="w-full h-[28rem] md:h-[34rem] object-cover object-top rounded-2xl hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>

                    {/* Texto */}
                    <div
                        className={`md:w-7/12 animate-on-scroll ${about.isVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: '200ms' }}
                    >
                        <h2 className="text-4xl font-bold mb-6">
                            <span className="text-teal-500">Quiénes </span>
                            <span className="text-gray-800">Somos</span>
                        </h2>
                        <p className="text-gray-600 mb-5 leading-relaxed">
                            Talentree está dirigida por <strong>Karina Rojas</strong>, psicóloga organizacional
                            con experiencia en procesos de evaluación, selección y desarrollo para la industria
                            minera y empresas de servicios.
                        </p>
                        <p className="text-gray-600 mb-5 leading-relaxed">
                            Desarrollamos soluciones adaptadas a las necesidades de cada organización y trabajamos
                            como socio de las áreas de Recursos Humanos y Gestión de Personas, con procesos
                            flexibles, rigurosos y ajustados a las particularidades de cada operación.
                        </p>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Contamos con experiencia en evaluación de competencias y potencial de trabajadores
                            vinculados a operaciones mineras, incluyendo evaluaciones para identificar candidatos
                            a procesos de especialización y certificación.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="#services"
                                className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 hover:scale-105 transition-all duration-300"
                            >
                                Conoce nuestros servicios
                            </a>
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border border-gray-400 px-6 py-3 rounded-full hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                            >
                                Contáctanos
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== SERVICIOS ====== */}
            <section
                ref={services.ref}
                id="services"
                className="py-24 bg-white overflow-hidden"
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className={`text-3xl font-bold mb-3 animate-on-scroll ${services.isVisible ? 'visible' : ''}`}>
                            Servicios
                        </h2>
                        <p
                            className={`text-gray-500 max-w-2xl mx-auto animate-on-scroll ${services.isVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: '100ms' }}
                        >
                            Lo que hacemos en Talentree, adaptado a las necesidades de cada organización.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {SERVICIOS.map((servicio, index) => (
                            <div
                                key={servicio.titulo}
                                className={`bg-gray-50 border border-gray-100 p-6 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-on-scroll ${services.isVisible ? 'visible' : ''}`}
                                style={{ transitionDelay: `${150 + index * 60}ms` }}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">{servicio.titulo}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">{servicio.detalle}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== EN TERRENO (FOTOS) ====== */}
            <section
                ref={gallery.ref}
                id="gallery"
                className="py-24 bg-gray-50 overflow-hidden"
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className={`text-3xl font-bold mb-3 animate-on-scroll ${gallery.isVisible ? 'visible' : ''}`}>
                            En terreno
                        </h2>
                        <p
                            className={`text-gray-500 max-w-2xl mx-auto animate-on-scroll ${gallery.isVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: '100ms' }}
                        >
                            Talleres, charlas y jornadas de trabajo con equipos de distintas organizaciones.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {FOTOS.map((foto, index) => (
                            <figure
                                key={foto.src}
                                className={`group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 animate-on-scroll ${gallery.isVisible ? 'visible' : ''}`}
                                style={{ transitionDelay: `${150 + index * 100}ms` }}
                            >
                                <img
                                    src={foto.src}
                                    alt={foto.alt}
                                    loading="lazy"
                                    className={`w-full h-56 md:h-72 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-700 ${foto.portrait ? 'object-[center_20%]' : 'object-center'}`}
                                />
                                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-sm px-4 py-3">
                                    {foto.caption}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== PROCESOS ACTIVOS ====== */}
            <section
                ref={processes.ref}
                id="processes"
                className="py-24 bg-white overflow-hidden"
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className={`text-3xl font-bold mb-3 animate-on-scroll ${processes.isVisible ? 'visible' : ''}`}>
                            Oportunidades Laborales
                        </h2>
                        <p
                            className={`text-gray-500 mb-8 text-justify md:text-center animate-on-scroll ${processes.isVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: '100ms' }}
                        >
                            Procesos de selección abiertos. Postula a los que se ajusten a tu perfil.
                        </p>
                    </div>

                    {isLoadingProcesses ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 mt-4">Cargando oportunidades...</p>
                        </div>
                    ) : publicProcesses.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl">
                            <p className="text-gray-500 text-lg">
                                No hay procesos activos en este momento.
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Vuelve pronto para ver nuevas oportunidades.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publicProcesses.map((process: any, index: number) => (
                                <div
                                    key={process.id}
                                    className={`bg-white border border-gray-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 animate-on-scroll hover:-translate-y-2 flex flex-col ${processes.isVisible ? 'visible' : ''}`}
                                    style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                {process.position}
                                            </h3>
                                            <p className="text-sm text-teal-600 font-medium">
                                                {process.company?.name || "Empresa"}
                                            </p>
                                        </div>
                                    </div>

                                    {process.location && (
                                        <div className="flex items-center text-sm text-gray-500 mb-3">
                                            <span className="mr-1">📍</span>
                                            <span>{process.location}</span>
                                        </div>
                                    )}

                                    {process.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                            {process.description}
                                        </p>
                                    )}

                                    {process.department && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                                {process.department}
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleApplyToProcess(process.id)}
                                        disabled={applyingProcessId === process.id}
                                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 mt-auto ${
                                            applyingProcessId === process.id
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-teal-500 hover:bg-teal-600 text-white hover:scale-105"
                                        }`}
                                    >
                                        {applyingProcessId === process.id ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Postulando...
                                            </span>
                                        ) : (
                                            "Postular →"
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {publicProcesses.length > 0 && (
                        <div className="text-center mt-12">
                            <button
                                onClick={() => navigate('/oportunidades')}
                                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:scale-105"
                            >
                                Revisa oportunidades
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ====== TESTIMONIOS ====== */}
            <section
                ref={testimonials.ref}
                className="py-20 bg-gray-50 text-center overflow-hidden"
            >
                <h2 className={`text-3xl font-bold mb-8 animate-on-scroll ${testimonials.isVisible ? 'visible' : ''}`}>
                    Testimonios
                </h2>
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-6">
                    <div
                        className={`bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 animate-on-scroll hover:-translate-y-2 flex flex-col text-left ${testimonials.isVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: '100ms' }}
                    >
                        <p className="text-gray-600 mb-8 italic leading-relaxed">
                            "Quiero destacar la calidad del servicio recibido por parte de Talentree. Su equipo mostró un nivel de profesionalismo y claridad muy acorde a nuestras exigencias, comprendiendo con precisión los perfiles y competencias que buscábamos.

                            El proceso fue ordenado, transparente y eficiente, lo que nos permitió avanzar con seguridad en cada etapa. El resultado final fue plenamente satisfactorio, logrando incorporar profesionales que se alinean de manera consistente con la cultura y los objetivos de nuestra organización."
                        </p>
                        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-4">
                            <img
                                src="/anwo.png"
                                alt="Anwo Logo"
                                className="w-28 h-16 object-contain flex-shrink-0"
                            />
                            <div className="text-left">
                                <h4 className="font-semibold text-gray-800">
                                    Andres Baeza
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Subgerente de Marketing
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 animate-on-scroll hover:-translate-y-2 flex flex-col text-left ${testimonials.isVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: '300ms' }}
                    >
                        <p className="text-gray-600 mb-8 italic leading-relaxed">
                            "Tuve la oportunidad de trabajar con Karina y destaco su profundo entendimiento de las necesidades del cliente. Es una profesional que impulsa procesos de selección ágiles y eficientes, asegurando la incorporación de postulantes idóneos, alineados al perfil requerido y con las competencias necesarias para potenciar a la organización."
                        </p>
                        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-4">
                            <img
                                src="/lureye.png"
                                alt="Lureye Logo"
                                className="w-28 h-16 object-contain flex-shrink-0"
                            />
                            <div className="text-left">
                                <h4 className="font-semibold text-gray-800">
                                    Oscar Lorca
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Gerente de negocios
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== BANNER ====== */}
            <section className="relative bg-gray-900 py-24 text-white overflow-hidden">
                <img
                    src="/cierre-taller.jpg"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                {/* Oscurece el lado del texto para que se lea sobre las caras
                    de la foto sin apagar la foto entera. */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/60 to-gray-900/20" aria-hidden="true"></div>
                <div className="relative max-w-6xl mx-auto px-6 animate-fade-in">
                    <h2 className="text-4xl font-bold mb-4">¿Necesitas apoyo en selección o desarrollo?</h2>
                    <p className="text-lg max-w-xl leading-relaxed">
                        Cuéntanos qué necesita tu operación y te proponemos un proceso ajustado a tu realidad, con plazos y alcance definidos desde el inicio.
                    </p>
                    <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full hover:scale-105 transition-all duration-300 inline-block"
                    >
                        Conversemos por WhatsApp
                    </a>
                </div>
            </section>

            {/* ====== CONTACTO ====== */}
            <section
                ref={contact.ref}
                id="contact"
                className="py-20 bg-gradient-to-b from-white to-teal-50 overflow-hidden"
            >
                <div className="max-w-6xl mx-auto px-6">
                    {/* Título de la sección */}
                    <div className="text-center mb-12">
                        <h2 className={`text-3xl font-bold mb-3 animate-on-scroll ${contact.isVisible ? 'visible' : ''}`}>
                            Contáctanos
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div className={`animate-on-scroll ${contact.isVisible ? 'visible' : ''}`}>
                            <iframe
                                src="https://www.google.com/maps?q=santiago%20chile&output=embed"
                                className="w-full h-80 rounded-xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-500"
                            ></iframe>
                        </div>

                        <form
                            onSubmit={handleContactSubmit}
                            className={`bg-white shadow-xl rounded-2xl p-8 space-y-5 animate-on-scroll hover:shadow-2xl transition-shadow duration-500 ${contact.isVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: '200ms' }}
                        >
                            <div className="mb-4">
                                <h3 className="text-xl font-bold mb-2">
                                    Formulario de Contacto
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Llena este formulario para que un ejecutivo de Talentree se ponga en contacto con tu empresa
                                </p>
                            </div>

                            {contactFormSubmitted && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                                    <p className="font-semibold">¡Gracias por contactarnos!</p>
                                    <p className="text-sm mt-1">Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.</p>
                                </div>
                            )}

                            <input
                                type="text"
                                placeholder="Nombre *"
                                required
                                value={contactForm.nombre}
                                onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
                                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono *"
                                required
                                value={contactForm.telefono}
                                onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                            />
                            <input
                                type="email"
                                placeholder="Correo *"
                                required
                                value={contactForm.correo}
                                onChange={(e) => setContactForm({ ...contactForm, correo: e.target.value })}
                                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                            />
                            <textarea
                                placeholder="Tu mensaje... *"
                                required
                                rows={6}
                                value={contactForm.asunto}
                                onChange={(e) => setContactForm({ ...contactForm, asunto: e.target.value })}
                                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
                            />
                            <button
                                type="submit"
                                disabled={isSubmittingContact}
                                className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 hover:scale-105 transition-all duration-300 w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isSubmittingContact ? "Enviando..." : "Enviar"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ====== FOOTER ====== */}
            <Footer />
        </div>
    );
};
