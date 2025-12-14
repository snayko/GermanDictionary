import type { Word, WordFormData, Translation, Example } from '../types';

// ----------------------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ----------------------------------------------------------------------

// SWA Auth types
interface SwaClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
  claims: { typ: string; val: string }[];
}

interface SwaAuthResponse {
  clientPrincipal: SwaClientPrincipal | null;
}

// Cache for auth info
let cachedAuthInfo: SwaClientPrincipal | null = null;
let authFetchPromise: Promise<SwaClientPrincipal | null> | null = null;

// ----------------------------------------------------------------------

// API response types matching Go API
interface ApiWord {
  id: string;
  userId: string;
  german: string;
  article?: string | null;
  wordType: string;
  translations: {
    en?: string[];
    ru?: string[];
    uk?: string[];
  };
  level?: string | null;
  examples: { german: string; translation: string }[];
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  notes?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface WordListResponse {
  words: ApiWord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface SyncRequest {
  lastSyncAt?: string;
  changes: ApiSyncChange[];
}

interface ApiSyncChange {
  id: string;
  german: string;
  article?: string | null;
  wordType: string;
  translations: {
    en?: string[];
    ru?: string[];
    uk?: string[];
  };
  level?: string | null;
  examples?: { german: string; translation: string }[];
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  notes?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  clientUpdatedAt: string;
  isDeleted?: boolean;
}

interface SyncResponse {
  serverChanges: ApiWord[];
  deletedIds: string[];
  syncedAt: string;
}

interface ApiUser {
  id: string;
  providerId: string;
  email?: string;
  identityProvider?: string;
  displayName?: string;
  avatarUrl?: string;
}

// ----------------------------------------------------------------------

class ApiService {
  private baseUrl: string;
  private authCheckedAt: number = 0;
  private readonly AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Get SWA auth info (cached, but refreshes periodically)
  async getSwaAuth(): Promise<SwaClientPrincipal | null> {
    const now = Date.now();
    
    // Return cached if valid and not expired
    if (cachedAuthInfo && (now - this.authCheckedAt) < this.AUTH_CACHE_TTL) {
      return cachedAuthInfo;
    }
    
    // If we have an in-flight request, wait for it
    if (authFetchPromise) return authFetchPromise;

    authFetchPromise = (async () => {
      try {
        // Call SWA's auth endpoint (only works when hosted on SWA)
        const response = await fetch('/.auth/me', { credentials: 'include' });
        if (!response.ok) return null;
        
        const data: SwaAuthResponse = await response.json();
        cachedAuthInfo = data.clientPrincipal;
        this.authCheckedAt = Date.now();
        return cachedAuthInfo;
      } catch {
        // Not running on SWA or auth not available
        return null;
      } finally {
        authFetchPromise = null;
      }
    })();

    return authFetchPromise;
  }

  // Clear cached auth (call on logout or to force refresh)
  clearAuthCache(): void {
    cachedAuthInfo = null;
    this.authCheckedAt = 0;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get SWA auth info and pass to API
    const authInfo = await this.getSwaAuth();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // If we have SWA auth, encode and send as header (mimics what SWA proxy does)
    if (authInfo) {
      const principalData = JSON.stringify({ clientPrincipal: authInfo });
      headers['X-Ms-Client-Principal'] = btoa(principalData);
      headers['X-Ms-Client-Principal-Id'] = authInfo.userId;
      headers['X-Ms-Client-Principal-Name'] = authInfo.userDetails;
      headers['X-Ms-Client-Principal-Idp'] = authInfo.identityProvider;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string; database: string }> {
    return this.request('/health');
  }

  async getMe(): Promise<ApiUser> {
    return this.request('/me');
  }

  async getWords(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<WordListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/words${query ? `?${query}` : ''}`);
  }

  async getWord(id: string): Promise<ApiWord> {
    return this.request(`/words/${id}`);
  }

  async createWord(data: WordFormData): Promise<ApiWord> {
    const apiData = localFormToApiFormat(data);
    return this.request('/words', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  async updateWord(id: string, data: Partial<WordFormData>): Promise<ApiWord> {
    const apiData = localFormToApiFormat(data as WordFormData);
    return this.request(`/words/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });
  }

  async deleteWord(id: string): Promise<void> {
    return this.request(`/words/${id}`, {
      method: 'DELETE',
    });
  }

  async syncWords(request: SyncRequest): Promise<SyncResponse> {
    return this.request('/words/sync', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// ----------------------------------------------------------------------
// Format converters
// ----------------------------------------------------------------------

function localFormToApiFormat(formData: WordFormData): Omit<ApiSyncChange, 'id' | 'clientUpdatedAt'> {
  const translations: { en?: string[]; ru?: string[]; uk?: string[] } = {};
  
  if (formData.englishTranslation?.trim()) {
    translations.en = formData.englishTranslation.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (formData.russianTranslation?.trim()) {
    translations.ru = formData.russianTranslation.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (formData.ukrainianTranslation?.trim()) {
    translations.uk = formData.ukrainianTranslation.split(',').map(s => s.trim()).filter(Boolean);
  }

  return {
    german: formData.german.trim(),
    article: formData.gender || null,
    wordType: formData.wordType,
    translations,
    level: formData.frequencyLevel || null,
    examples: formData.examples?.filter(e => e.german?.trim()).map(e => ({
      german: e.german.trim(),
      translation: e.translation?.trim() || '',
    })),
    synonyms: formData.synonyms?.filter(Boolean) || [],
    antonyms: formData.antonyms?.filter(Boolean) || [],
    collocations: formData.collocations?.filter(Boolean) || [],
    notes: formData.notes?.trim() || null,
    imageUrl: formData.imageUrl?.trim() || null,
  };
}

export function localWordToApiSync(word: Word, isDeleted = false): ApiSyncChange {
  const translations: { en?: string[]; ru?: string[]; uk?: string[] } = {};
  
  const enTrans = word.translations.find(t => t.language === 'english');
  const ruTrans = word.translations.find(t => t.language === 'russian');
  const ukTrans = word.translations.find(t => t.language === 'ukrainian');
  
  if (enTrans?.text) translations.en = enTrans.text.split(',').map(s => s.trim()).filter(Boolean);
  if (ruTrans?.text) translations.ru = ruTrans.text.split(',').map(s => s.trim()).filter(Boolean);
  if (ukTrans?.text) translations.uk = ukTrans.text.split(',').map(s => s.trim()).filter(Boolean);

  return {
    id: word.id,
    german: word.german,
    article: word.gender || null,
    wordType: word.wordType,
    translations,
    level: word.frequencyLevel || null,
    examples: word.examples?.map(e => ({
      german: e.german,
      translation: e.translation || '',
    })),
    synonyms: word.synonyms || [],
    antonyms: word.antonyms || [],
    collocations: word.collocations || [],
    notes: word.notes || null,
    imageUrl: word.imageUrl || null,
    audioUrl: word.audioUrl || null,
    clientUpdatedAt: word.updatedAt,
    isDeleted,
  };
}

export function apiWordToLocal(apiWord: ApiWord): Word {
  const translations: Translation[] = [];
  
  if (apiWord.translations.en?.length) {
    translations.push({ language: 'english', text: apiWord.translations.en.join(', ') });
  }
  if (apiWord.translations.ru?.length) {
    translations.push({ language: 'russian', text: apiWord.translations.ru.join(', ') });
  }
  if (apiWord.translations.uk?.length) {
    translations.push({ language: 'ukrainian', text: apiWord.translations.uk.join(', ') });
  }

  const examples: Example[] | undefined = apiWord.examples?.length 
    ? apiWord.examples.map(e => ({
        german: e.german,
        translation: e.translation || undefined,
      }))
    : undefined;

  return {
    id: apiWord.id,
    german: apiWord.german,
    gender: apiWord.article as Word['gender'],
    wordType: apiWord.wordType as Word['wordType'],
    translations,
    frequencyLevel: apiWord.level as Word['frequencyLevel'],
    examples,
    synonyms: apiWord.synonyms?.length ? apiWord.synonyms : undefined,
    antonyms: apiWord.antonyms?.length ? apiWord.antonyms : undefined,
    collocations: apiWord.collocations?.length ? apiWord.collocations : undefined,
    notes: apiWord.notes || undefined,
    imageUrl: apiWord.imageUrl || undefined,
    audioUrl: apiWord.audioUrl || undefined,
    createdAt: apiWord.createdAt,
    updatedAt: apiWord.updatedAt,
  };
}

// ----------------------------------------------------------------------

export const apiService = new ApiService(API_BASE_URL);
export type { ApiWord, WordListResponse, SyncRequest, SyncResponse, ApiUser };
export default apiService;
