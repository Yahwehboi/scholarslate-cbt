import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Sequential so tests don't race over the same in-memory DB instance
    pool: "forks",
    singleFork: true,
    include: ["src/**/*.test.ts"],
    coverage: {
      reporter: ["text"],
      include: ["src/routes/**", "src/validation/**"],
    },
  },
});
