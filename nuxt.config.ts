// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  head: {
    "icon": false
  },

  modules: [
    'nuxt-icon',
    '@nuxtjs/tailwindcss', 
    '@nuxtjs/color-mode',
    ['@nuxtjs/google-fonts', {
      families: {
        Roboto: true,
        Inter: [400, 700],
        'Josefin+Sans': true,
        Lato: [100, 300],
        Raleway: {
          wght: [100, 400],
          ital: [100]
        },
      }
    }],
  ],

  compatibilityDate: '2024-08-06',
})
