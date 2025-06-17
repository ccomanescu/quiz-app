export interface Question {
  question: string;
  answers: string[];
  correct_answer: number;
  image?: string;
}

export interface QuizResult {
  questionIndex: number;
  userAnswer: number;
  isCorrect: boolean;
  question: Question;
}

export interface Subject {
  name: string;
  displayName: string;
  module: number;
}

export interface QuizMode {
  type: 'all' | 'module' | 'subject' | 'random';
  moduleNumber?: number;
  subjectName?: string;
  randomizeAnswers?: boolean; // Adaugă această opțiune
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  results: QuizResult[];
  wrongAnswers: Question[];
  isCompleted: boolean;
  isReviewMode: boolean;
  mode: QuizMode;
}
