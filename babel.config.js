module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "module:react-native-dotenv",
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};