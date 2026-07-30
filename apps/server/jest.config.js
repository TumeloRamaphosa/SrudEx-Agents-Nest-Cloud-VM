/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testPathIgnorePatterns: ["/node_modules/", "__mocks__"],
  moduleNameMapper: {
    "^next/server$": "<rootDir>/__tests__/__mocks__/next-server.ts",
  },
};
