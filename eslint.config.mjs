import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import prettierPlugin from "eslint-plugin-prettier";

const eslintConfig = [
  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // Next.js flat config (recommended for Next 15+ with ESLint 9)
  {
    plugins: {
      "@next/next": nextPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "prettier/prettier": "error",
    },
  },
  
  // TypeScript specific rules
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  
  // Custom RTL Tailwind rule
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "custom-rtl": {
        rules: {
          "no-physical-tailwind": {
            create(context) {
              const regex = /(?:^|[\s"'`])(-?)(ml|mr|pl|pr|left|right)-(?:[0-9a-zA-Z]+|\[[^\]]+\])\b|(?:^|[\s"'`])text-(left|right)\b/;
              function check(node, val) {
                if (typeof val === "string" && regex.test(val)) {
                  const match = val.match(regex);
                  context.report({
                    node,
                    message: `Avoid physical direction class "${match ? match[0].trim() : val}". Use logical RTL equivalent (ms-*, me-*, ps-*, pe-*, start-*, end-*, text-start, text-end) instead.`,
                  });
                }
              }
              return {
                Literal(node) {
                  check(node, node.value);
                },
                TemplateElement(node) {
                  check(node, node.value.raw);
                }
              };
            }
          }
        }
      }
    },
    rules: {
      "custom-rtl/no-physical-tailwind": "error"
    }
  },
  
  // Ignores
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "*.config.{js,ts,mjs}",
      "*.config.{js,ts,mjs}",
    ]
  }
];

export default eslintConfig;
