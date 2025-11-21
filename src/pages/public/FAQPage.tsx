import { useState } from "react";
import { Navbar } from "../../components/public/Navbar";
import { Footer } from "../../components/public/Footer";
import { ChevronDown, ChevronUp, Users, Building2, CreditCard, Headphones, Search } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    // Para Trabajadores
    {
        category: "Para Trabajadores",
        question: "¿Cómo me registro en Talentree?",
        answer: "Para registrarte, haz clic en el botón 'Registrarse' en la página principal. Completa el formulario con tu información personal, experiencia laboral y habilidades. Una vez completado, recibirás un correo de confirmación para activar tu cuenta."
    },
    {
        category: "Para Trabajadores",
        question: "¿Cómo postulo a una oportunidad laboral?",
        answer: "Navega por las oportunidades disponibles en la sección 'Oportunidades'. Cuando encuentres una que te interese, haz clic en 'Ver Detalles' y luego en 'Postular'. Algunos procesos pueden requerir que completes tests psicotécnicos o grabes un video introductorio."
    },
    {
        category: "Para Trabajadores",
        question: "¿Qué son los tests psicotécnicos y son obligatorios?",
        answer: "Los tests psicotécnicos son evaluaciones diseñadas para medir habilidades cognitivas, rasgos de personalidad y competencias laborales. Su obligatoriedad depende de cada proceso de selección. La empresa especificará si son requisito para la postulación."
    },
    {
        category: "Para Trabajadores",
        question: "¿Cuánto tiempo tengo para completar un test?",
        answer: "Cada test tiene un tiempo límite específico que se mostrará antes de comenzar. Generalmente oscilan entre 15 y 60 minutos. Una vez iniciado el test, debes completarlo en una sola sesión sin interrupciones."
    },
    {
        category: "Para Trabajadores",
        question: "¿Qué es el video introductorio y cómo lo grabo?",
        answer: "El video introductorio es una presentación personal que algunas empresas requieren. Necesitarás una cámara y micrófono. Durante la grabación, aparecerán preguntas guía para que las respondas. La duración máxima varía según el proceso, típicamente entre 2-5 minutos."
    },
    {
        category: "Para Trabajadores",
        question: "¿Puedo editar mi perfil después de registrarme?",
        answer: "Sí, puedes actualizar tu perfil en cualquier momento desde la sección 'Mi Perfil'. Te recomendamos mantener tu información actualizada, especialmente tu experiencia laboral y certificaciones."
    },
    {
        category: "Para Trabajadores",
        question: "¿Cómo sé el estado de mi postulación?",
        answer: "Puedes ver el estado de todas tus postulaciones en la sección 'Mis Postulaciones'. Cada postulación mostrará su estado actual: Postulado, En Revisión, Test Completado, Entrevista Programada, Seleccionado o Rechazado."
    },
    {
        category: "Para Trabajadores",
        question: "¿Puedo postular a múltiples oportunidades simultáneamente?",
        answer: "Sí, no hay límite en la cantidad de oportunidades a las que puedes postular. Te recomendamos revisar cuidadosamente los requisitos de cada posición antes de postular."
    },

    // Para Empresas
    {
        category: "Para Empresas",
        question: "¿Cómo registro mi empresa en Talentree?",
        answer: "Contacta con nuestro equipo comercial a través del formulario de contacto o llamando al +56 9 1111 1111. Un ejecutivo te guiará en el proceso de registro y selección del plan más adecuado para tu empresa."
    },
    {
        category: "Para Empresas",
        question: "¿Qué información necesito para publicar una oportunidad?",
        answer: "Necesitarás definir: título del cargo, descripción de funciones, requisitos (experiencia, estudios, certificaciones), ubicación, tipo de contrato, rango salarial (opcional), y si requieres tests psicotécnicos o video introductorio."
    },
    {
        category: "Para Empresas",
        question: "¿Puedo personalizar los tests psicotécnicos?",
        answer: "Sí, puedes seleccionar entre nuestra biblioteca de tests disponibles o solicitar tests personalizados. Los planes Premium y Enterprise incluyen acceso a tests especializados para el sector minero."
    },
    {
        category: "Para Empresas",
        question: "¿Cómo gestiono a los candidatos?",
        answer: "Desde tu panel de control puedes ver todos los candidatos por proceso, revisar sus perfiles completos, resultados de tests, videos introductorios, y cambiar su estado en el proceso de selección. También puedes dejar comentarios internos para tu equipo."
    },
    {
        category: "Para Empresas",
        question: "¿Puedo invitar trabajadores directamente?",
        answer: "Sí, puedes invitar trabajadores específicos a postular a tus procesos. Solo necesitas su correo electrónico. Ellos recibirán una invitación y podrán postular directamente al proceso."
    },
    {
        category: "Para Empresas",
        question: "¿Cuántos usuarios administradores puede tener mi empresa?",
        answer: "El número de usuarios varía según tu plan: Plan Básico incluye 2 usuarios, Plan Profesional incluye 5 usuarios, y Plan Enterprise incluye usuarios ilimitados."
    },
    {
        category: "Para Empresas",
        question: "¿Los datos de los candidatos son confidenciales?",
        answer: "Sí, todos los datos están protegidos según la Ley N° 19.628 de Chile. Solo tu empresa tendrá acceso a la información de los candidatos que postulen a tus procesos. Talentree no comparte información de candidatos con terceros."
    },

    // Planes y Pagos
    {
        category: "Planes y Pagos",
        question: "¿Cuáles son los planes disponibles?",
        answer: "Ofrecemos tres planes: Básico (perfecto para pequeñas empresas), Profesional (ideal para medianas empresas con múltiples procesos), y Enterprise (solución completa para grandes corporaciones). Visita nuestra sección 'Planes' para más detalles."
    },
    {
        category: "Planes y Pagos",
        question: "¿Los precios incluyen IVA?",
        answer: "Los precios mostrados en nuestro sitio web no incluyen IVA. El IVA (19%) se agregará al monto final según la legislación chilena vigente."
    },
    {
        category: "Planes y Pagos",
        question: "¿Puedo cambiar de plan?",
        answer: "Sí, puedes actualizar tu plan en cualquier momento. Al mejorar tu plan, tendrás acceso inmediato a las nuevas funcionalidades. La diferencia de precio se prorrateará en tu siguiente factura."
    },
    {
        category: "Planes y Pagos",
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos transferencias bancarias, tarjetas de crédito y débito. Para planes anuales, también ofrecemos la opción de pago mediante orden de compra para empresas con convenio."
    },
    {
        category: "Planes y Pagos",
        question: "¿Ofrecen periodo de prueba?",
        answer: "Sí, ofrecemos un periodo de prueba de 14 días para que conozcas todas las funcionalidades de la plataforma. No requiere tarjeta de crédito para comenzar."
    },
    {
        category: "Planes y Pagos",
        question: "¿Cómo cancelo mi suscripción?",
        answer: "Puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. Tu acceso continuará hasta el final del periodo de facturación actual. No se realizan reembolsos por periodos no utilizados."
    },

    // Técnico y Soporte
    {
        category: "Técnico y Soporte",
        question: "¿Qué navegadores son compatibles?",
        answer: "Talentree funciona en las versiones más recientes de Chrome, Firefox, Safari y Edge. Para una experiencia óptima, recomendamos mantener tu navegador actualizado."
    },
    {
        category: "Técnico y Soporte",
        question: "¿Puedo usar Talentree desde mi móvil?",
        answer: "Sí, nuestra plataforma es totalmente responsive y funciona en dispositivos móviles. Sin embargo, para completar tests psicotécnicos y grabar videos, recomendamos usar una computadora de escritorio o laptop."
    },
    {
        category: "Técnico y Soporte",
        question: "Olvidé mi contraseña, ¿qué hago?",
        answer: "En la página de inicio de sesión, haz clic en '¿Olvidaste tu contraseña?'. Ingresa tu correo electrónico y recibirás instrucciones para restablecer tu contraseña."
    },
    {
        category: "Técnico y Soporte",
        question: "¿Cómo contacto al soporte técnico?",
        answer: "Puedes contactarnos llamando al +56 9 6371 7583. Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00 hrs."
    },
    {
        category: "Técnico y Soporte",
        question: "¿Qué hago si experimento problemas técnicos durante un test?",
        answer: "Si experimentas problemas técnicos durante un test, contacta inmediatamente a soporte técnico. Podremos reiniciar el test si es necesario. Guarda capturas de pantalla del error si es posible."
    }
];

const categoryIcons = {
    "Para Trabajadores": Users,
    "Para Empresas": Building2,
    "Planes y Pagos": CreditCard,
    "Técnico y Soporte": Headphones
};

export const FAQPage = () => {
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
    const [searchQuery, setSearchQuery] = useState("");

    const categories = ["Todos", ...Array.from(new Set(faqs.map(faq => faq.category)))];

    const toggleItem = (index: number) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            newOpenItems.add(index);
        }
        setOpenItems(newOpenItems);
    };

    const filteredFaqs = faqs
        .filter(faq => selectedCategory === "Todos" || faq.category === selectedCategory)
        .filter(faq =>
            searchQuery === "" ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Animated Background with Orange Gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 -z-10">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <Navbar />

            <main className="flex-1 py-52 relative z-10">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="inline-block mb-4">
                            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
                                Centro de Ayuda
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600">
                            Preguntas Frecuentes
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Encuentra respuestas rápidas a tus dudas sobre Talentree
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8 max-w-2xl mx-auto">
                        <div className="relative backdrop-blur-xl bg-white/40 border border-white/60 rounded-2xl shadow-xl p-2">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                            <input
                                type="text"
                                placeholder="Buscar preguntas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-3 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-lg"
                            />
                        </div>
                    </div>

                    {/* Category Filter - Glassmorphism Cards */}
                    <div className="mb-12">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {categories.map((category) => {
                                const Icon = category !== "Todos" ? categoryIcons[category as keyof typeof categoryIcons] : null;
                                const isSelected = selectedCategory === category;

                                return (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                                            isSelected
                                                ? "backdrop-blur-xl bg-gradient-to-br from-orange-500/90 to-amber-500/90 border border-white/40 shadow-2xl"
                                                : "backdrop-blur-xl bg-white/30 border border-white/60 hover:bg-white/50 shadow-lg"
                                        }`}
                                    >
                                        <div className="relative z-10 text-center">
                                            {Icon && (
                                                <Icon className={`w-8 h-8 mx-auto mb-2 ${
                                                    isSelected ? "text-white" : "text-orange-600"
                                                }`} />
                                            )}
                                            <span className={`text-sm font-bold ${
                                                isSelected ? "text-white" : "text-gray-800"
                                            }`}>
                                                {category}
                                            </span>
                                        </div>

                                        {/* Hover Effect */}
                                        <div className={`absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                            isSelected ? "hidden" : ""
                                        }`}></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* FAQ Items - Glassmorphism Style */}
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {filteredFaqs.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">No se encontraron resultados para tu búsqueda.</p>
                            </div>
                        ) : (
                            filteredFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:bg-white/50"
                                >
                                    <button
                                        onClick={() => toggleItem(index)}
                                        className="w-full px-6 py-5 flex items-start gap-4 text-left group"
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                openItems.has(index)
                                                    ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg"
                                                    : "bg-orange-100 group-hover:bg-orange-200"
                                            }`}>
                                                {openItems.has(index) ? (
                                                    <ChevronUp className="w-5 h-5 text-white" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-orange-600" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-orange-700 bg-orange-100 mb-2">
                                                {faq.category}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                                                {faq.question}
                                            </h3>
                                        </div>
                                    </button>

                                    {openItems.has(index) && (
                                        <div className="px-6 pb-6 animate-fadeIn">
                                            <div className="pl-12 pr-4">
                                                <div className="backdrop-blur-sm bg-white/60 rounded-xl p-4 border-l-4 border-orange-500">
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Contact Section - Glassmorphism */}
                    <div className="mt-16 backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-white/60 rounded-3xl p-10 text-center shadow-2xl">
                        <div className="inline-block p-4 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 mb-4">
                            <Headphones className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-3">
                            ¿No encontraste tu respuesta?
                        </h2>
                        <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
                            Nuestro equipo de soporte está disponible para ayudarte con cualquier duda que tengas.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center items-center text-gray-800">
                            <div className="backdrop-blur-sm bg-white/60 rounded-xl px-6 py-3">
                                <strong className="text-orange-700">Teléfono:</strong> +56 9 6371 7583
                            </div>
                            <div className="backdrop-blur-sm bg-white/60 rounded-xl px-6 py-3">
                                <strong className="text-orange-700">Horario:</strong> Lunes a Viernes, 9:00 - 18:00 hrs
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }

                .animate-blob {
                    animation: blob 7s infinite;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};
