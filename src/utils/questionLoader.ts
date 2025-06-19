import type { Question, CustomQuizSettings, Subject } from '../types';



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


// Funcția de bază pentru încărcarea întrebărilor
export const loadQuestions = async (subjectName: string): Promise<Question[]> => {
	 try {
    const baseUrl = import.meta.env.VITE_BASE_URL || '/';
    const response = await fetch(`${baseUrl}questions/${subjectName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load questions for ${subjectName}`);
    }
		const data = await response.json();
		return data;
  } catch (error) {
    console.error(`Error loading questions for ${subjectName}:`, error);
    return [];
  }
};

// Funcție pentru a adăuga ID-uri unice la întrebări
const addQuestionIds = (questions: Question[], prefix: string): Question[] => {
	return questions.map((question, index) => ({
		...question,
		id: `${prefix}_${index}`,
	}));
};

// Încarcă toate întrebările folosind loadQuestions
export const loadAllQuestions = async (): Promise<Question[]> => {
	const allQuestions: Question[] = [];

	for (const module of modules) {
		for (const subject of module.subjects) {
			const questions = await loadQuestions(subject.name);
			allQuestions.push(...questions);
		}
	}

	return allQuestions;
};

// Încarcă întrebările unui modul folosind loadQuestions
export const loadModuleQuestions = async (moduleNumber: number): Promise<Question[]> => {
	const module = modules.find(m => m.number === moduleNumber);
	if (!module) return [];

	const moduleQuestions: Question[] = [];

	for (const subject of module.subjects) {
		const questions = await loadQuestions(subject.name);
		moduleQuestions.push(...questions);
	}

	return moduleQuestions;
};

// Încarcă 36 întrebări aleatorii folosind loadAllQuestions
export const loadRandomQuestions = async (): Promise<Question[]> => {
	const allQuestions = await loadAllQuestions();
	const shuffled = allQuestions.sort(() => Math.random() - 0.5);
	return shuffled.slice(0, 36);
};

// Încarcă toate întrebările cu ID-uri pentru interfața de selecție
export const loadAllQuestionsWithIds = async (): Promise<Question[]> => {
	const allQuestions: Question[] = [];

	for (const module of modules) {
		for (const subject of module.subjects) {
			const questions = await loadQuestions(subject.name);
			const questionsWithIds = addQuestionIds(questions, subject.name);
			allQuestions.push(...questionsWithIds);
		}
	}

	return allQuestions;
};

// Încarcă întrebările personalizate
export const loadCustomQuestions = async (settings: CustomQuizSettings): Promise<Question[]> => {
	const allQuestionsWithIds = await loadAllQuestionsWithIds();
	const selectedQuestions = allQuestionsWithIds.filter(question =>
		settings.selectedQuestionIds.includes(question.id || '')
	);

	// Remove IDs before returning to keep consistency with other quiz types
	return selectedQuestions.map(({ ...question }) => question);
};
