import type { Question, Subject } from '../types';

export const subjects: Subject[] = [
  // Module 1 (base module - no prefix) - în ordinea cerută
  { name: 'fundamentele_programarii', displayName: 'Fundamentele Programării', module: 1 },
  { name: 'programare_in_python', displayName: 'Programare în Python', module: 1 },
  { name: 'programare_orientata_obiect', displayName: 'Programare Orientată pe Obiecte (C++)', module: 1 },
  { name: 'metode_avansate_programare_java', displayName: 'Metode Avansate de Programare (Java)', module: 1 },
  { name: 'tehnici_avansate_programare', displayName: 'Tehnici Avansate de Programare', module: 1 },
  { name: 'algoritmi_si_structuri_de_date', displayName: 'Algoritmi și Structuri de Date', module: 1 },
  
  // Module 2 - în ordinea cerută
  { name: 'modul_2_baze_de_date', displayName: 'Baze de Date', module: 2 },
  { name: 'modul_2_sisteme_de_gestiune_a_bazelor_de_date', displayName: 'Sisteme de Gestiune a Bazelor de Date', module: 2 },
  
  // Module 3 - în ordinea cerută
  { name: 'modul_3_sisteme_de_operare', displayName: 'Sisteme de Operare', module: 3 },
  { name: 'modul_3_retele_de_calculatoare', displayName: 'Rețele de Calculatoare', module: 3 },
  { name: 'modul_3_administrare_retele_de_calculatoare', displayName: 'Administrarea Rețelelor de Calculatoare', module: 3 },
  { name: 'modul_3_criptografie', displayName: 'Criptografie', module: 3 },
  
  // Module 4 - în ordinea cerută
  { name: 'modul_4_tehnologii_web', displayName: 'Tehnologii Web', module: 4 },
  { name: 'modul_4_comert_electronic', displayName: 'Comerț Electronic', module: 4 },
  { name: 'modul_4_cloud_computing', displayName: 'Cloud Computing', module: 4 },
  { name: 'modul_4_inovare_si_transformare_digitala', displayName: 'Inovare și Transformare Digitală', module: 4 },
];

export const modules = [
  { number: 1, name: 'Programare și Algoritmi', subjects: subjects.filter(s => s.module === 1) },
  { number: 2, name: 'Baze de Date', subjects: subjects.filter(s => s.module === 2) },
  { number: 3, name: 'Sisteme și Rețele', subjects: subjects.filter(s => s.module === 3) },
  { number: 4, name: 'Tehnologii Moderne', subjects: subjects.filter(s => s.module === 4) },
];

export const loadQuestions = async (subjectName: string): Promise<Question[]> => {
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL || '/';
    const response = await fetch(`${baseUrl}questions/${subjectName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load questions for ${subjectName}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading questions for ${subjectName}:`, error);
    return [];
  }
};

export const loadAllQuestions = async (): Promise<Question[]> => {
  const allQuestions: Question[] = [];
  
  for (const subject of subjects) {
    const questions = await loadQuestions(subject.name);
    allQuestions.push(...questions);
  }
  
  return allQuestions;
};

export const loadModuleQuestions = async (moduleNumber: number): Promise<Question[]> => {
  const moduleSubjects = subjects.filter(s => s.module === moduleNumber);
  const allQuestions: Question[] = [];
  
  for (const subject of moduleSubjects) {
    const questions = await loadQuestions(subject.name);
    allQuestions.push(...questions);
  }
  
  return allQuestions;
};

export const loadRandomQuestions = async (): Promise<Question[]> => {
  const randomQuestions: Question[] = [];
  
  // Get 2 questions from each subject (16 subjects × 2 = 32 questions)
  for (const subject of subjects) {
    const questions = await loadQuestions(subject.name);
    if (questions.length >= 2) {
      // Shuffle and take first 2
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      randomQuestions.push(...shuffled.slice(0, 2));
    } else {
      // If less than 2 questions, take all
      randomQuestions.push(...questions);
    }
  }
  
  // Add 4 more random questions from any subject to reach 36 total
  const allQuestions = await loadAllQuestions();
  const remainingQuestions = allQuestions.filter(q => 
    !randomQuestions.some(rq => rq.question === q.question)
  );
  
  const shuffledRemaining = remainingQuestions.sort(() => Math.random() - 0.5);
  randomQuestions.push(...shuffledRemaining.slice(0, 4));
  
  // Final shuffle
  return randomQuestions.sort(() => Math.random() - 0.5);
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
