import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Word, WordFormData, Translation, TranslationLanguage, Example } from '../types';

// ----------------------------------------------------------------------

interface UseWordsOptions {
  onWordChanged?: (wordId: string) => Promise<void>;
}

export function useWords(options?: UseWordsOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { onWordChanged } = options || {};

  // Live query for all words
  const words = useLiveQuery(() => db.words.orderBy('updatedAt').reverse().toArray(), []);

  // Search/filter words
  const searchWords = useCallback(async (query: string): Promise<Word[]> => {
    if (!query.trim()) {
      return db.words.orderBy('updatedAt').reverse().toArray();
    }
    
    const lowerQuery = query.toLowerCase();
    const allWords = await db.words.toArray();
    
    return allWords.filter((word) => {
      // Search in German word
      if (word.german.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in translations
      const hasMatchingTranslation = word.translations.some(
        (t) => t.text.toLowerCase().includes(lowerQuery)
      );
      if (hasMatchingTranslation) return true;
      
      // Search in examples (now objects with german and translation)
      if (word.examples?.some((ex) => 
        ex.german.toLowerCase().includes(lowerQuery) || 
        ex.translation?.toLowerCase().includes(lowerQuery)
      )) return true;
      
      // Search in synonyms
      if (word.synonyms?.some((s) => s.toLowerCase().includes(lowerQuery))) return true;
      
      // Search in notes
      if (word.notes?.toLowerCase().includes(lowerQuery)) return true;
      
      return false;
    });
  }, []);

  // Helper to build translations array from form data
  const buildTranslations = (formData: WordFormData): Translation[] => {
    const translations: Translation[] = [];
    
    if (formData.englishTranslation?.trim()) {
      translations.push({ language: 'english' as TranslationLanguage, text: formData.englishTranslation.trim() });
    }
    if (formData.russianTranslation?.trim()) {
      translations.push({ language: 'russian' as TranslationLanguage, text: formData.russianTranslation.trim() });
    }
    if (formData.ukrainianTranslation?.trim()) {
      translations.push({ language: 'ukrainian' as TranslationLanguage, text: formData.ukrainianTranslation.trim() });
    }
    
    return translations;
  };

  // Helper to clean examples (filter out empty ones)
  const cleanExamples = (examples?: Example[]): Example[] | undefined => {
    if (!examples || examples.length === 0) return undefined;
    
    const cleaned = examples.filter((ex) => ex.german?.trim());
    return cleaned.length > 0 ? cleaned.map((ex) => ({
      german: ex.german.trim(),
      translation: ex.translation?.trim() || undefined,
      source: ex.source?.trim() || undefined,
    })) : undefined;
  };

  // Helper to clean string arrays (filter out empty strings)
  const cleanStringArray = (arr?: string[]): string[] | undefined => {
    if (!arr || arr.length === 0) return undefined;
    const cleaned = arr.filter((s) => s?.trim()).map((s) => s.trim());
    return cleaned.length > 0 ? cleaned : undefined;
  };

  // Add a new word
  const addWord = useCallback(async (formData: WordFormData): Promise<Word> => {
    setIsLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const newWord: Word = {
        id: uuidv4(),
        german: formData.german.trim(),
        translations: buildTranslations(formData),
        wordType: formData.wordType,
        gender: formData.wordType === 'noun' ? formData.gender : undefined,
        frequencyLevel: formData.frequencyLevel || undefined,
        examples: cleanExamples(formData.examples),
        synonyms: cleanStringArray(formData.synonyms),
        antonyms: cleanStringArray(formData.antonyms),
        collocations: cleanStringArray(formData.collocations),
        notes: formData.notes?.trim() || undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };

      await db.words.add(newWord);
      
      // Sync to server if callback provided
      if (onWordChanged) {
        onWordChanged(newWord.id).catch(console.error);
      }
      
      return newWord;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add word';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onWordChanged]);

  // Update an existing word
  const updateWord = useCallback(async (id: string, formData: WordFormData): Promise<Word> => {
    setIsLoading(true);
    setError(null);

    try {
      const existingWord = await db.words.get(id);
      if (!existingWord) {
        throw new Error('Word not found');
      }

      const updatedWord: Word = {
        ...existingWord,
        german: formData.german.trim(),
        translations: buildTranslations(formData),
        wordType: formData.wordType,
        gender: formData.wordType === 'noun' ? formData.gender : undefined,
        frequencyLevel: formData.frequencyLevel || undefined,
        examples: cleanExamples(formData.examples),
        synonyms: cleanStringArray(formData.synonyms),
        antonyms: cleanStringArray(formData.antonyms),
        collocations: cleanStringArray(formData.collocations),
        notes: formData.notes?.trim() || undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      await db.words.put(updatedWord);
      
      // Sync to server if callback provided
      if (onWordChanged) {
        onWordChanged(updatedWord.id).catch(console.error);
      }
      
      return updatedWord;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update word';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onWordChanged]);

  // Delete a word
  const deleteWord = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await db.words.delete(id);
      // Also delete associated review data
      await db.reviews.delete(id);
      
      // Sync deletion to server if callback provided
      if (onWordChanged) {
        onWordChanged(id).catch(console.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete word';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onWordChanged]);

  // Get a single word by ID
  const getWord = useCallback(async (id: string): Promise<Word | undefined> => {
    return db.words.get(id);
  }, []);

  // Get word count
  const wordCount = useLiveQuery(() => db.words.count(), []);

  return {
    words: words ?? [],
    wordCount: wordCount ?? 0,
    isLoading,
    error,
    addWord,
    updateWord,
    deleteWord,
    getWord,
    searchWords,
  };
}
