export const Footer = () => {
    return (
        <footer className="bg-white border-t text-gray-600 py-10">
            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
                <div>
                    <img
                        src="/talentreelogo.png"
                        alt="Talentree"
                        className="h-40 mb-4"
                    />
                    <p className="mb-2">Teléfonos: +56 9 6371 7583</p>
                    <p className="mb-4">Dirección: Av. Nombre #123, Ciudad, Chile</p>
                    <div className="flex gap-4 mt-4">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-teal-500 transition"
                            aria-label="Facebook"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                            </svg>
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-teal-500 transition"
                            aria-label="Instagram"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Nombre Empresa</h4>
                    <ul className="space-y-2">
                        <li>
                            <a href="#home" className="hover:text-teal-500 transition">
                                Home
                            </a>
                        </li>
                        <li>
                            <a href="#about" className="hover:text-teal-500 transition">
                                Quienes Somos
                            </a>
                        </li>
                        <li>
                            <a href="#services" className="hover:text-teal-500 transition">
                                Servicios
                            </a>
                        </li>
                        <li>
                            <a href="#plans" className="hover:text-teal-500 transition">
                                Planes
                            </a>
                        </li>
                        <li>
                            <a href="#contact" className="hover:text-teal-500 transition">
                                Contacto
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Contacto</h4>
                    <ul className="space-y-2">
                        <li>
                            <a href="#contact" className="hover:text-teal-500 transition">
                                Contáctanos
                            </a>
                        </li>
                        <li>
                            <a href="/terms" className="hover:text-teal-500 transition">
                                Términos y Condiciones
                            </a>
                        </li>
                        <li>
                            <a href="/faq" className="hover:text-teal-500 transition">
                                Preguntas Frecuentes
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="text-center text-sm mt-10 border-t pt-4">
                Copyright © 2024 Talentree
            </div>
        </footer>
    );
};
