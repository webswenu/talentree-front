import { useState } from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-white shadow fixed w-full z-50 top-0">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="/talentreelogo.png"
                        alt="Talentree"
                        className="h-40"
                    />
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8 items-center">
                    <a href="#home" className="hover:text-teal-500 transition">
                        Home
                    </a>
                    <a href="#about" className="hover:text-teal-500 transition">
                        Quienes Somos
                    </a>
                    <a href="#services" className="hover:text-teal-500 transition">
                        Servicios
                    </a>
                    <a href="#plans" className="hover:text-teal-500 transition">
                        Planes
                    </a>
                    <a href="#contact" className="hover:text-teal-500 transition">
                        Contacto
                    </a>
                    <Link
                        to="/login"
                        className="bg-teal-500 text-white px-5 py-2 rounded-full hover:bg-teal-600 transition"
                    >
                        Ingresa
                    </Link>
                </div>

                {/* Hamburger Button */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-2"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span
                        className={`block w-6 h-0.5 bg-gray-800 transition-transform ${
                            isMenuOpen ? "rotate-45 translate-y-2" : ""
                        }`}
                    ></span>
                    <span
                        className={`block w-6 h-0.5 bg-gray-800 transition-opacity ${
                            isMenuOpen ? "opacity-0" : ""
                        }`}
                    ></span>
                    <span
                        className={`block w-6 h-0.5 bg-gray-800 transition-transform ${
                            isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                        }`}
                    ></span>
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden bg-white border-t shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
                    isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="flex flex-col gap-4 px-6 py-4">
                    <a
                        href="#home"
                        className="hover:text-teal-500 transition"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </a>
                    <a
                        href="#about"
                        className="hover:text-teal-500 transition"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Quienes Somos
                    </a>
                    <a
                        href="#services"
                        className="hover:text-teal-500 transition"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Servicios
                    </a>
                    <a
                        href="#plans"
                        className="hover:text-teal-500 transition"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Planes
                    </a>
                    <a
                        href="#contact"
                        className="hover:text-teal-500 transition"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Contacto
                    </a>
                    <Link
                        to="/login"
                        className="bg-teal-500 text-white px-5 py-2 rounded-full hover:bg-teal-600 transition text-center"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Ingresa
                    </Link>
                </div>
            </div>
        </nav>
    );
};
