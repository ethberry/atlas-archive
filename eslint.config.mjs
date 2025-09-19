import path from "node:path";
import { fileURLToPath } from "node:url";

import typescriptRules from "@ethberry/eslint-config/presets/tsx.mjs";

// DON'T ADD ANY RULES!
// FIX YOUR SHIT!!!

export default [
  {
    ignores: [
      ".next",
      "node_modules",
      "components/ui",
      "lib/db/supabase.types.ts",
      "next-auth.d.ts",
      "eslint.config.mjs"
    ]
  },

  {
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.eslint.json",
        ],
        tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url)),
      },
    },
  },

  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.eslint.json',
        },
      },
    },
  },

  ...typescriptRules,
];
