import Dexie, { type EntityTable } from 'dexie';
import type { Word, ReviewData, UserSettings } from '../types';

// ----------------------------------------------------------------------

export const db = new Dexie('GermanDictionary') as Dexie & {
  words: EntityTable<Word, 'id'>;
  reviews: EntityTable<ReviewData, 'wordId'>;
  settings: EntityTable<UserSettings & { id: string }, 'id'>;
};

db.version(1).stores({
  words: 'id, german, wordType, createdAt, updatedAt',
  reviews: 'wordId, nextReviewDate',
  settings: 'id',
});

// ----------------------------------------------------------------------
// Default Settings
// ----------------------------------------------------------------------

export const DEFAULT_SETTINGS: UserSettings = {
  preferredLanguages: ['english', 'russian', 'ukrainian'],
  reviewDirection: 'german-to-translation',
  dailyReviewGoal: 20,
  theme: 'light',
};
