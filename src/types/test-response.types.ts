import { Test, TestQuestion } from './test.types';
import { WorkerProcess } from './worker.types';

export interface TestAnswer {
  id: string;
  answer: any;
  score?: number;
  isCorrect: boolean;
  evaluatorComment?: string;
  question: TestQuestion;
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
  metadata?: Record<string, any>;
  test: Test;
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
}

export interface SubmitAnswerDto {
  questionId: string;
  answer: any;
}

export interface SubmitTestDto {
  answers: SubmitAnswerDto[];
}

export interface EvaluateAnswerDto {
  score: number;
  isCorrect: boolean;
  evaluatorComment?: string;
}
