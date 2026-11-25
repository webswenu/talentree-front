import type { ReactNode } from "react";

/** Mismo fondo y tarjeta que la pantalla de inicio de sesión. */
export const AuthCard = ({
    titulo,
    children,
}: {
    titulo: string;
    children: ReactNode;
}) => (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/cta2.jpg)" }}
        >
            <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="card max-w-md w-full m-4 relative z-10">
            <div className="text-center mb-6">
                <img
                    src="/talentreelogo.png"
                    alt="Talentree"
                    className="h-24 mx-auto mb-2"
                />
            </div>
            <h2 className="text-2xl font-semibold text-center mb-6">{titulo}</h2>
            {children}
        </div>
    </div>
);
