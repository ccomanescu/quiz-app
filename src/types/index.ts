export interface Question {
  question: string;
  answers: string[];
  correct_answer: number;
  image?: string;
  id?: string; // Adaugă ID unic pentru fiecare întrebare
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

export interface CustomQuizSettings {
  selectedQuestionIds: string[]; // Array cu ID-urile întrebărilor selectate
}

export interface QuizMode {
  type: 'all' | 'module' | 'subject' | 'random' | 'custom';
  moduleNumber?: number;
  subjectName?: string;
  randomizeAnswers?: boolean;
  customSettings?: CustomQuizSettings;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  results: QuizResult[];
  wrongAnswers: Question[];
  isCompleted: boolean;
  isReviewMode: boolean;
  mode: QuizMode;
  startTime?: number; // Adaugă timpul de start
  endTime?: number;   // Adaugă timpul de sfârșit
}
