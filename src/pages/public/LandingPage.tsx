// /src/pages/LandingPage.tsx
import { Link } from "react-router-dom";

export const LandingPage = () => {
  return (
    <div className="font-sans text-gray-800">
      {/* ====== NAVBAR ====== */}
      <nav className="bg-white shadow fixed w-full z-50 top-0">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/talentreelogo.png" alt="Talentree" className="h-10" />
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#home" className="hover:text-teal-500">Home</a>
            <a href="#about" className="hover:text-teal-500">Quienes Somos</a>
            <a href="#services" className="hover:text-teal-500">Servicios</a>
            <a href="#plans" className="hover:text-teal-500">Planes</a>
            <a href="#contact" className="hover:text-teal-500">Contacto</a>
            <Link
              to="/login"
              className="bg-teal-500 text-white px-5 py-2 rounded-full hover:bg-teal-600 transition"
            >
              Ingresa
            </Link>
          </div>
        </div>
      </nav>

      {/* ====== HERO ====== */}
      <section id="home" className="pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h1 className="text-5xl font-bold mb-6">
              <span className="text-teal-500">Esto </span>
              es un <span className="text-gray-700">Título</span>
            </h1>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <div className="flex gap-4">
              <button className="border border-gray-400 px-6 py-3 rounded-full hover:bg-gray-100 transition">
                Saber más
              </button>
              <button className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 transition">
                Comienza aquí →
              </button>
            </div>
          </div>

          <div className="md:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-400 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-400 rounded-full blur-3xl opacity-50"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img src="/images/meeting.jpg" alt="Reunión" className="rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ====== QUIÉNES SOMOS ====== */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          {/* Imagen */}
          <div className="md:w-1/2 relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-400 rounded-full blur-3xl opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400 rounded-full blur-3xl opacity-40"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/images/about-team.jpg"
                alt="Equipo Talentree"
                className="rounded-2xl"
              />
            </div>
          </div>

          {/* Texto */}
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-teal-500">Quiénes </span>
              <span className="text-gray-800">Somos</span>
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              En <strong>Talentree</strong> creemos en el poder del talento como motor de crecimiento.
              Somos una empresa especializada en soluciones de <strong>Reclutamiento y Selección Inteligente</strong>,
              enfocada en conectar a las personas adecuadas con las oportunidades correctas.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Nuestro equipo combina experiencia en recursos humanos, análisis de datos y
              tecnología avanzada para ofrecer procesos más eficientes, objetivos y personalizados.
            </p>

            <div className="flex gap-4">
              <a
                href="#services"
                className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 transition"
              >
                Conoce nuestros servicios
              </a>
              <a
                href="#contact"
                className="border border-gray-400 px-6 py-3 rounded-full hover:bg-gray-100 transition"
              >
                Contáctanos
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* ====== PROPUESTA DE VALOR ====== */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">Propuesta de Valor</h2>
          <p className="text-gray-500 mb-12">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {["Edificio", "Usuario", "Monitoreo"].map((_, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition"
              >
                <div className="bg-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl">
                    {i === 0 ? "🏢" : i === 1 ? "🧑‍💼" : "📈"}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Título</h3>
                <p className="text-gray-500 text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIOS ====== */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold mb-8">Testimonios</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {[1, 2].map((id) => (
            <div
              key={id}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <p className="text-gray-500 mb-6 italic">
                “Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.”
              </p>
              <div className="flex items-center justify-center gap-4">
                <img
                  src="/images/avatar.png"
                  alt="Autor"
                  className="w-12 h-12 rounded-full"
                />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800">Author Name</h4>
                  <p className="text-sm text-gray-500">Cargo/Profesión</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== BANNER ====== */}
      <section className="relative bg-orange-100 py-20 text-white overflow-hidden">
        <img
          src="/images/banner.jpg"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">Título Banner</h2>
          <p className="text-lg max-w-xl">
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.
          </p>
          <button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full">
            Botón
          </button>
        </div>
      </section>

      {/* ====== CONTACTO ====== */}
      <section id="contact" className="py-20 bg-gradient-to-b from-white to-teal-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 px-6 items-start">
          <div>
            <iframe
              src="https://www.google.com/maps?q=santiago%20chile&output=embed"
              className="w-full h-80 rounded-xl border-0"
            ></iframe>
          </div>

          <form className="bg-white shadow-xl rounded-2xl p-8 space-y-5">
            <h3 className="text-2xl font-bold mb-2">Formulario de Contacto</h3>
            <input type="text" placeholder="Nombre" className="w-full border rounded-lg px-4 py-3" />
            <input type="text" placeholder="Teléfono" className="w-full border rounded-lg px-4 py-3" />
            <input type="email" placeholder="Correo" className="w-full border rounded-lg px-4 py-3" />
            <input type="text" placeholder="Asunto" className="w-full border rounded-lg px-4 py-3" />
            <button className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition w-full">
              Enviar
            </button>
          </form>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-white border-t text-gray-600 py-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <img src="/logo-talentree.png" alt="Talentree" className="h-12 mb-4" />
            <p>Teléfonos: +56 9 1111 1111 / +56 9 1111 1111</p>
            <p>Dirección: Av. Nombre #123, Ciudad, Chile</p>
            <div className="flex gap-4 mt-4 text-xl">
              <a href="#" className="hover:text-teal-500"></a>
              <a href="#" className="hover:text-teal-500"></a>
              <a href="#" className="hover:text-teal-500"></a>
              <a href="#" className="hover:text-teal-500"></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Nombre Empresa</h4>
            <ul className="space-y-2">
              <li>Home</li>
              <li>Quienes Somos</li>
              <li>Servicios</li>
              <li>Planes</li>
              <li>Contacto</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li>Contáctanos</li>
              <li>Afiliados</li>
              <li>Política de Cancelación</li>
              <li>Términos y Condiciones</li>
              <li>Preguntas Frecuentes</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm mt-10 border-t pt-4">
          Copyright © 2024 Company Name
        </div>
      </footer>
    </div>
  );
};
