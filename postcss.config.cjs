// postcss.config.cjs
module.exports = {
  plugins: {
    'postcss-preset-env': {
      stage: 0, // Enables modern CSS features
    },
    autoprefixer: {},
  },
};
