import '@testing-library/jest-dom/vitest'

// Node exposes an experimental localStorage global that is not a Web Storage
// implementation. Provide a small deterministic Web Storage double instead.
const values = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, String(value)),
  },
})

