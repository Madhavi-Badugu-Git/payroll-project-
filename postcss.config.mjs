import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';

const postcssConfig = {
  plugins: [
    tailwindcss('./tailwind.config.js'),
    autoprefixer,
    postcssPresetEnv({
      stage: 0,
      features: {
        'oklab-function': { preserve: false },
      },
    }),
  ],
};

export default postcssConfig;
