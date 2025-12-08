// ----------------------------------------------------------------------
// Word Types
// ----------------------------------------------------------------------

export type WordType = 
  | 'noun' 
  | 'verb' 
  | 'adjective' 
  | 'adverb' 
  | 'phrase' 
  | 'preposition' 
  | 'conjunction' 
  | 'pronoun'
  | 'article'
  | 'other';

export type Gender = 'der' | 'die' | 'das';

export type FrequencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type TranslationLanguage = 'english' | 'russian' | 'ukrainian';

export interface Translation {
  language: TranslationLanguage;
  text: string;
}

// Rich example with translation
export interface Example {
  german: string;
  translation?: string;
  source?: string; // e.g., "Duden", "textbook", etc.
}

export interface Word {
  id: string;
  german: string;
  translations: Translation[];
  wordType: WordType;
  gender?: Gender; // for nouns
  frequencyLevel?: FrequencyLevel;
  examples?: Example[];
  synonyms?: string[]; // related German words
  antonyms?: string[]; // opposite German words
  collocations?: string[]; // common word combinations
  notes?: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// Review Types (for future Anki feature)
// ----------------------------------------------------------------------

export interface ReviewData {
  wordId: string;
  easeFactor: number; // starts at 2.5
  interval: number; // days until next review
  repetitions: number;
  nextReviewDate: string;
  lastReviewDate?: string;
  reviewLanguage: TranslationLanguage;
}

// ----------------------------------------------------------------------
// User Settings
// ----------------------------------------------------------------------

export interface UserSettings {
  preferredLanguages: TranslationLanguage[];
  reviewDirection: 'german-to-translation' | 'translation-to-german' | 'both';
  dailyReviewGoal: number;
  theme: 'light' | 'dark' | 'system';
}

// ----------------------------------------------------------------------
// Form Types
// ----------------------------------------------------------------------

export interface WordFormData {
  german: string;
  englishTranslation?: string;
  russianTranslation?: string;
  ukrainianTranslation?: string;
  wordType: WordType;
  gender?: Gender;
  frequencyLevel?: FrequencyLevel;
  examples?: Example[];
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  notes?: string;
  imageUrl?: string;
}

// ----------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------

export const WORD_TYPES: { value: WordType; label: string }[] = [
  { value: 'noun', label: 'Noun' },
  { value: 'verb', label: 'Verb' },
  { value: 'adjective', label: 'Adjective' },
  { value: 'adverb', label: 'Adverb' },
  { value: 'phrase', label: 'Phrase' },
  { value: 'preposition', label: 'Preposition' },
  { value: 'conjunction', label: 'Conjunction' },
  { value: 'pronoun', label: 'Pronoun' },
  { value: 'article', label: 'Article' },
  { value: 'other', label: 'Other' },
];

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'der', label: 'der (masculine)' },
  { value: 'die', label: 'die (feminine)' },
  { value: 'das', label: 'das (neuter)' },
];

export const FREQUENCY_LEVELS: { value: FrequencyLevel; label: string }[] = [
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Proficient' },
];

// ----------------------------------------------------------------------
// API Types (for cloud sync)
// ----------------------------------------------------------------------

export interface ApiWord {
  id: string;
  german: string;
  article?: Gender;
  wordType: WordType;
  translationEN?: string;
  translationRU?: string;
  translationUK?: string;
  level?: FrequencyLevel;
  examples?: Example[];
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
