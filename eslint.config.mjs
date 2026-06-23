import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("next/typescript"),
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
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ]
  }
];

export default eslintConfig;
