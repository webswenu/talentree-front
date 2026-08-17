import { User } from "./user.types";

export enum TestType {
    PSYCHOMETRIC = "psychometric",
    TECHNICAL = "technical",
    PERSONALITY = "personality",
    APTITUDE = "aptitude",
    KNOWLEDGE = "knowledge",
}

export enum QuestionType {
    MULTIPLE_CHOICE = "multiple_choice",
    TRUE_FALSE = "true_false",
    /**
     * P-31. El valor era "open_text" y el backend guarda "open_ended".
     *
     * Como el `switch` que dibuja la pregunta compara por valor, ninguna rama
     * coincidía: la pregunta de texto abierto salía en blanco, sin campo donde
     * escribir, y el candidato quedaba atrapado sin poder avanzar ni enviar.
     * El nombre de la constante se conserva para no tocar los 6 archivos que
     * la usan; lo que importa es el valor, que ahora sí coincide.
     */
    OPEN_TEXT = "open_ended",
    SCALE = "scale",
    MULTIPLE_RESPONSE = "multiple_response",
    // Tipos específicos para tests fijos
    MULTIPLE_CHOICE_TERNARY = "multiple_choice_ternary",
    FORCED_CHOICE = "forced_choice",
    LIKERT_SCALE = "likert_scale",
    TABLE_CHECKBOX = "table_checkbox",
}

/**
 * P-32. Los tipos que el backend acepta DE VERDAD al crear un test normal
 * (ver QuestionType en talentree-backend-v2).
 *
 * El selector del formulario recorría `Object.values(QuestionType)` y ofrecía
 * los 9, incluidos los 4 que son exclusivos de los tests fijos y uno
 * ("multiple_response") que no existe en ningún enum del backend. Elegir
 * cualquiera de esos 5 producía un test que el backend rechaza.
 */
export const TIPOS_DE_PREGUNTA_SOPORTADOS: QuestionType[] = [
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.TRUE_FALSE,
    QuestionType.OPEN_TEXT,
    QuestionType.SCALE,
];

export interface TestQuestion {
    id: string;
    question: string;
    type: QuestionType;
    options?: string[];
    correctAnswers?: string[];
    points: number;
    order: number;
    isRequired: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Test {
    id: string;
    name: string;
    description?: string;
    type: TestType;
    duration?: number;
    passingScore?: number;
    isActive: boolean;
    requiresManualReview: boolean;
    createdBy: User;
    questions: TestQuestion[];
    createdAt: Date;
    updatedAt: Date;
    testStatus?: 'available' | 'in_progress' | 'completed' | 'incomplete';
}

export interface FixedTest {
    id: string;
    code: string;
    name: string;
    description?: string;
    duration?: number;
    isActive: boolean;
    orderIndex?: number;
    configuration: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    testStatus?: 'available' | 'in_progress' | 'completed' | 'incomplete';
}

export interface CreateQuestionDto {
    question: string;
    type: QuestionType;
    options?: string[];
    correctAnswers?: string[];
    points: number;
    order: number;
    isRequired?: boolean;
}

export interface CreateTestDto {
    name: string;
    description?: string;
    type: TestType;
    duration?: number;
    passingScore?: number;
    isActive?: boolean;
    requiresManualReview?: boolean;
    questions?: CreateQuestionDto[];
}

export type UpdateTestDto = Partial<CreateTestDto>;

export const TestTypeLabels: Record<TestType, string> = {
    [TestType.PSYCHOMETRIC]: "Psicométrico",
    [TestType.TECHNICAL]: "Técnico",
    [TestType.PERSONALITY]: "Personalidad",
    [TestType.APTITUDE]: "Aptitud",
    [TestType.KNOWLEDGE]: "Conocimiento",
};

export const TestTypeColors: Record<TestType, string> = {
    [TestType.PSYCHOMETRIC]: "bg-purple-100 text-purple-800",
    [TestType.TECHNICAL]: "bg-blue-100 text-blue-800",
    [TestType.PERSONALITY]: "bg-pink-100 text-pink-800",
    [TestType.APTITUDE]: "bg-green-100 text-green-800",
    [TestType.KNOWLEDGE]: "bg-yellow-100 text-yellow-800",
};

export const QuestionTypeLabels: Record<QuestionType, string> = {
    [QuestionType.MULTIPLE_CHOICE]: "Opción Múltiple",
    [QuestionType.TRUE_FALSE]: "Verdadero/Falso",
    [QuestionType.OPEN_TEXT]: "Texto Abierto",
    [QuestionType.SCALE]: "Escala",
    [QuestionType.MULTIPLE_RESPONSE]: "Respuesta Múltiple",
    [QuestionType.MULTIPLE_CHOICE_TERNARY]: "Opción Múltiple Ternaria (A/B/C)",
    [QuestionType.FORCED_CHOICE]: "Elección Forzada (Más/Menos)",
    [QuestionType.LIKERT_SCALE]: "Escala Likert (1-5)",
    [QuestionType.TABLE_CHECKBOX]: "Tabla con Casillas",
};
