module.exports = {
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "primary": "#003bff",
          "base-content": "#fff"
        },
      },
      "light",
    ],
    styled: true,
  },
};
