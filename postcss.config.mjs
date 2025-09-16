export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
    // Оптимизация CSS для продакшена
    ...(process.env.NODE_ENV === "production" && {
      cssnano: {
        preset: [
          "default",
          {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
            colormin: true,
            minifyFontValues: true,
            minifySelectors: true,
          },
        ],
      },
    }),
  },
};
