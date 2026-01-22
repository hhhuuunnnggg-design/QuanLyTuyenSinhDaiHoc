// config/index.ts
// Application configuration

export const config = {
  api: {
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8081",
    timeout: 30000,
  },
  app: {
    name: "Facebook Clone",
    version: "1.0.0",
  },
} as const;
