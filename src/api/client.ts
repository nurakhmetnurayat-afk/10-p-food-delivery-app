import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_PORT = 4100;
const TOKEN_KEY = 'foodgo.token';

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:${API_PORT}/api`;
  }
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:${API_PORT}/api`;
}

export const API_URL = resolveBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let token: string | null = null;

export const tokenStore = {
  async load(): Promise<string | null> {
    if (Platform.OS === 'web') token = globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
    else token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  },
  async save(value: string | null): Promise<void> {
    token = value;
    if (Platform.OS === 'web') {
      if (value) globalThis.localStorage?.setItem(TOKEN_KEY, value);
      else globalThis.localStorage?.removeItem(TOKEN_KEY);
    } else if (value) {
      await SecureStore.setItemAsync(TOKEN_KEY, value);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  },
};

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(`Нет связи с сервером (${API_URL}). Запущен ли сервер?`, 0);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error ?? 'Что-то пошло не так', response.status);
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Что-то пошло не так');
