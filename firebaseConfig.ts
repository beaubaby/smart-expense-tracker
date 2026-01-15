
/*
  firebaseConfig.ts is deprecated.
  This project now uses a backend + MongoDB. Use `apiClient.ts` for API calls.

  To keep existing imports working during migration this file exports a
  null `db` and `isConfigValid = false` and re-exports the API client helpers.
*/

console.warn("Deprecated: firebaseConfig.ts — use apiClient.ts to call backend APIs.");

export const db = null;
export const isConfigValid = false;

export * from "./apiClient";
