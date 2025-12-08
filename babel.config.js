module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/services': './src/services',
            '@/stores': './src/stores',
            '@/hooks': './src/hooks',
            '@/models': './src/models',
            '@/utils': './src/utils',
            '@/config': './src/config',
          },
        },
      ],
    ],
  };
};
