import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * Hook personalizado para activar animaciones cuando el elemento entra al viewport.
 */
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return { ref, visible };
};

export const LandingPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const toggleFAQ = (index: number) => setOpenFAQ(openFAQ === index ? null : index);

  const Section = ({
    children,
    id,
    className = "",
  }: {
    children: React.ReactNode;
    id?: string;
    className?: string;
  }) => {
    const { ref, visible } = useScrollAnimation();
    return (
      <section
        id={id}
        ref={ref}
        className={`${className} transition-all duration-1000 ease-out ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        {children}
      </section>
    );
  };

  return (
    <div className="font-sans text-gray-800 bg-gradient-to-b from-white via-teal-50 to-white overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="bg-white/80 backdrop-blur-md shadow-md fixed w-full z-50 top-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <img
            src="/talentreelogo.png"
            alt="Talentree"
            className="h-20 md:h-40 object-contain transition-transform duration-300 hover:scale-105"
          />
          <div className="hidden md:flex gap-8 items-center font-medium">
            <a href="#home" className="hover:text-teal-500 transition">Home</a>
            <a href="#about" className="hover:text-teal-500 transition">Quienes Somos</a>
            <a href="#services" className="hover:text-teal-500 transition">Servicios</a>
            <a href="#faq" className="hover:text-teal-500 transition">Preguntas</a>
            <a href="#contact" className="hover:text-teal-500 transition">Contacto</a>
            <Link
              to="/login"
              className="bg-teal-500 text-white px-5 py-2 rounded-full shadow hover:bg-teal-600 hover:shadow-lg transition-all duration-300"
            >
              Ingresa
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <Section
        id="home"
        className="pt-70 pb-30 relative overflow-hidden flex items-center justify-center text-center md:text-left"
      >
        <img
          src="/herosection.jpg"
          alt="Hero Talentree"
          className="absolute inset-0 w-full h-full object-cover brightness-100 transparent opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/40 via-white/30 to-teal-400/40"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 animate-fadeInUp">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-800">
              Conectamos <span className="text-teal-600">Talento</span> con las{" "}
              <span className="text-orange-500">Oportunidades</span> Correctas.
            </h1>
            <p className="text-gray-700 mb-8 leading-relaxed text-lg">
              En Talentree impulsamos tu crecimiento profesional mediante
              herramientas inteligentes de selección y reclutamiento.
            </p>
            <div className="flex gap-4">
              <button className="border border-teal-500 text-teal-600 px-6 py-3 rounded-full hover:bg-teal-50 transition-all duration-300">
                Saber más
              </button>
              <button className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-300">
                Comienza aquí →
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== QUIENES SOMOS ===== */}
      <Section id="about" className="py-28 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="md:w-1/2 relative group">
            <div className="overflow-hidden rounded-3xl shadow-lg transition-all duration-500 group-hover:shadow-2xl">
              <img
                src="/cta.jpg"
                alt="Equipo Talentree"
                className="object-cover w-full h-full transform group-hover:scale-105 transition duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
            </div>
          </div>

          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              <span className="text-teal-500">Quiénes </span>
              <span className="text-gray-800">Somos</span>
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed text-lg">
              En <strong>Talentree</strong> creemos en el poder del talento como motor de crecimiento.  
              Somos especialistas en soluciones de <strong>Reclutamiento y Selección Inteligente</strong>,
              conectando a las personas adecuadas con las oportunidades correctas.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed text-lg">
              Nuestro equipo combina experiencia en recursos humanos, análisis de datos y
              tecnología avanzada para ofrecer procesos más eficientes, objetivos y personalizados.
            </p>
            <div className="flex gap-4">
              <a
                href="#services"
                className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 hover:shadow-lg transition-all duration-300"
              >
                Conoce nuestros servicios
              </a>
              <a
                href="#contact"
                className="border border-gray-400 px-6 py-3 rounded-full hover:bg-gray-100 transition-all duration-300"
              >
                Contáctanos
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== SERVICIOS ===== */}
      <Section id="services" className="py-24 bg-white text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">Propuesta de Valor</h2>
        <p className="text-gray-500 mb-12 text-lg">
          Impulsamos la eficiencia y calidad en los procesos de selección de talento.
        </p>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {[
            { icon: "🏢", title: "Plataforma Empresarial", text: "Gestión integral del talento y reclutamiento eficiente." },
            { icon: "🧑‍💼", title: "Evaluaciones Inteligentes", text: "Análisis de competencias mediante IA y datos reales." },
            { icon: "📈", title: "Optimización Continua", text: "Medición de impacto y mejora constante en resultados." },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-white to-teal-50 p-8 rounded-3xl shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-700 ease-in-out"
            >
              <div className="text-5xl mb-4">{s.icon}</div>
              <h3 className="text-2xl font-semibold mb-3">{s.title}</h3>
              <p className="text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

{/* ====== BANNER ====== */} 
<section className="relative h-[70vh] min-h-[500px] text-white overflow-hidden flex items-center">
  {/* Imagen de fondo */}
  <img
    src="/cta2.jpg"
    alt="Banner"
    className="absolute inset-0 w-full h-full object-cover object-top opacity-80"
  />

  {/* Overlay degradado */}
  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/40 via-black/30 to-transparent"></div>

  {/* Contenedor principal */}
  <div className="relative max-w-7xl mx-auto px-6 z-10 w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
      {/* === Columna izquierda (texto) === */}
      <div className="max-w-xl animate-fadeInLeft">
        <h2 className="text-6xl font-bold mb-4 drop-shadow-lg">
          Título Banner
        </h2>
        <p className="text-lg mb-6 drop-shadow-md text-gray-100 leading-relaxed">
          Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
          sint. Velit officia consequat duis enim velit mollit. Exercitation
          veniam consequat.
        </p>
        <button className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
          Botón
        </button>
      </div>

      {/* === Columna derecha (espacio visual) === */}
      <div className="hidden md:block"></div>
    </div>
  </div>
</section>





      {/* ===== TESTIMONIOS ===== */}
      <Section id="testimonios" className="py-24 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold mb-12 text-gray-800">Testimonios</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {[1, 2].map((id) => (
            <div
              key={id}
              className="bg-white/90 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-700 ease-in-out"
            >
              <p className="text-gray-600 mb-6 italic">
                “Talentree transformó nuestro proceso de selección. Redujimos un 40% los tiempos de contratación.”
              </p>
              <div className="flex items-center justify-center gap-4">
                <img
                  src="/testimonio.jpg"
                  alt="Autor"
                  className="w-14 h-14 rounded-full object-cover shadow-md"
                />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800">María González</h4>
                  <p className="text-sm text-gray-500">Gerente de RRHH</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ===== FAQ ===== */}
      <Section id="faq" className="py-20 bg-gradient-to-b from-white to-teal-50 text-center">
        <h2 className="text-4xl font-bold mb-8 text-gray-800">Preguntas Frecuentes</h2>
        <div className="max-w-3xl mx-auto space-y-4 text-left">
          {[
            {
              q: "¿Cómo funciona Talentree?",
              a: "Talentree conecta empresas con talento mediante procesos de selección automatizados e inteligentes.",
            },
            {
              q: "¿Qué servicios ofrecen?",
              a: "Ofrecemos reclutamiento inteligente, evaluaciones de talento y asesorías en gestión de personas.",
            },
            {
              q: "¿Dónde puedo contactarlos?",
              a: "Puedes escribirnos directamente desde el formulario de contacto al final de esta página.",
            },
          ].map((faq, i) => (
            <div key={i} className="border rounded-2xl bg-white/80 shadow-sm hover:shadow-md transition-all">
              <button
                onClick={() => toggleFAQ(i)}
                className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-gray-800 hover:text-teal-600"
              >
                {faq.q}
                <span>{openFAQ === i ? "−" : "+"}</span>
              </button>
              {openFAQ === i && <div className="px-6 pb-4 text-gray-600">{faq.a}</div>}
            </div>
          ))}
        </div>
      </Section>

      {/* ===== CONTACTO ===== */}
      <Section id="contact" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 px-6 items-start">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps?q=santiago%20chile&output=embed"
              className="w-full h-96 border-0"
            ></iframe>
          </div>

          <form className="bg-white shadow-xl rounded-3xl p-8 space-y-5 border border-gray-100">
            <h3 className="text-3xl font-bold mb-2 text-gray-800">Contáctanos</h3>
            <p className="text-gray-500 mb-6">Envíanos tus dudas o comentarios y te responderemos a la brevedad.</p>
            <input type="text" placeholder="Nombre" className="w-full border rounded-lg px-4 py-3 focus:border-teal-500 outline-none" />
            <input type="text" placeholder="Teléfono" className="w-full border rounded-lg px-4 py-3 focus:border-teal-500 outline-none" />
            <input type="email" placeholder="Correo" className="w-full border rounded-lg px-4 py-3 focus:border-teal-500 outline-none" />
            <textarea placeholder="Mensaje" className="w-full border rounded-lg px-4 py-3 h-28 focus:border-teal-500 outline-none"></textarea>
            <button className="bg-gradient-to-r from-teal-500 to-orange-400 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-300 w-full font-semibold shadow-md hover:shadow-lg">
              Enviar Mensaje
            </button>
          </form>
        </div>
      </Section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t text-gray-700 py-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <img src="/talentreelogo.png" alt="Talentree" className="h-24 mb-4 object-contain" />
            <p>Teléfonos: +56 9 1111 1111 / +56 9 1111 1111</p>
            <p>Dirección: Av. Nombre #123, Ciudad, Chile</p>
            <div className="flex gap-5 mt-6 text-2xl">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-black hover:text-teal-500 transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-black hover:text-teal-500 transition">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-black hover:text-teal-500 transition">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-black hover:text-teal-500 transition">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Talentree</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-teal-500 transition">Home</a></li>
              <li><a href="#about" className="hover:text-teal-500 transition">Quienes Somos</a></li>
              <li><a href="#services" className="hover:text-teal-500 transition">Servicios</a></li>
              <li><a href="#faq" className="hover:text-teal-500 transition">Preguntas Frecuentes</a></li>
              <li><a href="#contact" className="hover:text-teal-500 transition">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Contacto</h4>
            <ul className="space-y-2">
              <li><a href="#contact" className="hover:text-teal-500 transition">Contáctanos</a></li>
              <li><a href="#faq" className="hover:text-teal-500 transition">Preguntas Frecuentes</a></li>
              <li><a href="/terminos" className="hover:text-teal-500 transition">Términos y Condiciones</a></li>
            </ul>
          </div>
        </div>

        <div className="text-center text-sm mt-10 border-t pt-4 text-gray-500">
          © 2024 Talentree. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};
