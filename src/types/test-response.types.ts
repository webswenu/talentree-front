import { Test, TestQuestion, FixedTest, FixedTestQuestion } from "./test.types";
import { WorkerProcess } from "./worker.types";

export interface TestAnswer {
    id: string;
    answer: string | string[] | number | null;
    score?: number;
    isCorrect: boolean;
    evaluatorComment?: string;
    /**
     * Solo viene en tests personalizados. En los tests fijos es null: la
     * pregunta cuelga de `fixedTestQuestion`. Estaba declarada como
     * obligatoria, y por eso nadie vio que leer `answer.question.id` rompia
     * la pantalla en las 665 respuestas que hay en produccion.
     */
    question?: TestQuestion | null;
    /** Solo viene en tests fijos (DISC, 16PF, IL, CFR, TAC, IC). */
    fixedTestQuestion?: FixedTestQuestion | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface TestResponse {
    id: string;
    startedAt?: Date;
    completedAt?: Date;
    score?: number;
    maxScore?: number;
    passed: boolean;
    isCompleted: boolean;
    evaluatorNotes?: string;
    metadata?: Record<string, unknown>;
    status?: string;
    /** Solo en tests personalizados; en los fijos viene null. */
    test?: Test | null;
    fixedTest?: FixedTest | null;
    /** Resultado de los tests fijos: score/maxScore quedan en null. */
    rawScores?: Record<string, number> | null;
    scaledScores?: Record<string, number> | null;
    interpretation?: Record<string, unknown> | string | null;
    workerProcess: WorkerProcess;
    worker?: {
        firstName: string;
        lastName: string;
    };
    answers: TestAnswer[];
    createdAt: Date;
    updatedAt: Date;
}

export interface StartTestDto {
    testId: string;
    workerProcessId: string;
    isFixedTest?: boolean;
}

export interface SubmitAnswerDto {
    questionId: string;
    answer: string | string[] | number | null;
}

export interface SubmitTestDto {
    answers: SubmitAnswerDto[];
}

export interface EvaluateAnswerDto {
    score: number;
    isCorrect: boolean;
    evaluatorComment?: string;
}

export interface TestResponseStats {
    total: number;
    completed: number;
    pending: number;
    passed: number;
    failed: number;
}
