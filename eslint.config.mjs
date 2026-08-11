import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "out/**"] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // `ignoreRestSiblings` permits the standard omit-a-field-via-rest idiom,
      // which is how CompoundSummary drops the MDX body.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
];

export default config;
