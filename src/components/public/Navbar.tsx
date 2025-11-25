import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuthStore();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        const section = document.querySelector(sectionId);
        if (section) {
            const navbarHeight = 160; // Altura del navbar
            const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            window.scrollTo({ top: sectionTop, behavior: 'smooth' });
        }
        setIsMenuOpen(false);
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
                    <a href="/#home" onClick={(e) => handleNavClick(e, "#home")} className="hover:text-teal-500 transition">
                        Home
                    </a>
                    <a href="/#about" onClick={(e) => handleNavClick(e, "#about")} className="hover:text-teal-500 transition">
                        Quienes Somos
                    </a>
                    <a href="/#services" onClick={(e) => handleNavClick(e, "#services")} className="hover:text-teal-500 transition">
                        Servicios
                    </a>
                    <a href="/#processes" onClick={(e) => handleNavClick(e, "#processes")} className="hover:text-teal-500 transition">
                        Oportunidades Laborales
                    </a>
                    <a href="/#contact" onClick={(e) => handleNavClick(e, "#contact")} className="hover:text-teal-500 transition">
                        Contacto
                    </a>
                    <Link
                        to={user ? "/dashboard" : "/login"}
                        className="bg-teal-500 text-white px-5 py-2 rounded-full hover:bg-teal-600 transition"
                    >
                        {user ? "Dashboard" : "Ingresa"}
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
                        href="/#home"
                        onClick={(e) => handleNavClick(e, "#home")}
                        className="hover:text-teal-500 transition"
                    >
                        Home
                    </a>
                    <a
                        href="/#about"
                        onClick={(e) => handleNavClick(e, "#about")}
                        className="hover:text-teal-500 transition"
                    >
                        Quienes Somos
                    </a>
                    <a
                        href="/#services"
                        onClick={(e) => handleNavClick(e, "#services")}
                        className="hover:text-teal-500 transition"
                    >
                        Servicios
                    </a>
                    <a
                        href="/#processes"
                        onClick={(e) => handleNavClick(e, "#processes")}
                        className="hover:text-teal-500 transition"
                    >
                        Oportunidades Laborales
                    </a>
                    <a
                        href="/#contact"
                        onClick={(e) => handleNavClick(e, "#contact")}
                        className="hover:text-teal-500 transition"
                    >
                        Contacto
                    </a>
                    <Link
                        to={user ? "/dashboard" : "/login"}
                        className="bg-teal-500 text-white px-5 py-2 rounded-full hover:bg-teal-600 transition text-center"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {user ? "Dashboard" : "Ingresa"}
                    </Link>
                </div>
            </div>
        </nav>
    );
};
