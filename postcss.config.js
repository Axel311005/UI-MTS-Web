const cssnano =
  process.env.NODE_ENV === 'production'
    ? { cssnano: { preset: 'default' } }
    : {};

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...cssnano,
  },
};
