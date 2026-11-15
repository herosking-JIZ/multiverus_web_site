// Polyfill mémoire pour sessionStorage dans l'environnement de test Node
const storeMap = new Map<string, string>();

const mockSessionStorage: Storage = {
  getItem: (key: string) => storeMap.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storeMap.set(key, String(value));
  },
  removeItem: (key: string) => {
    storeMap.delete(key);
  },
  clear: () => {
    storeMap.clear();
  },
  key: (index: number) => Array.from(storeMap.keys())[index] ?? null,
  get length() {
    return storeMap.size;
  },
};

Object.defineProperty(globalThis, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

const localStoreMap = new Map<string, string>();

const mockLocalStorage: Storage = {
  getItem: (key: string) => localStoreMap.get(key) ?? null,
  setItem: (key: string, value: string) => {
    localStoreMap.set(key, String(value));
  },
  removeItem: (key: string) => {
    localStoreMap.delete(key);
  },
  clear: () => {
    localStoreMap.clear();
  },
  key: (index: number) => Array.from(localStoreMap.keys())[index] ?? null,
  get length() {
    return localStoreMap.size;
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});
