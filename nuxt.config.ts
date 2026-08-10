export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',

  modules: ['@nuxt/content'],

  app: {
    head: {
      title: 'KO Boxing Package — Training Wiki',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Wiki and training guide for the KO Boxing Package by Andrii Khotin — boxing lessons, beginner and competitive workout plans, and video demonstrations.'
        }
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },

  css: ['~/assets/css/fonts.css', '~/assets/scss/carbon.scss', '~/assets/css/app.css'],

  content: {
    documentDriven: false,
    markdown: {
      anchorLinks: false
    },
    highlight: false
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['mixed-decls', 'global-builtin', 'import', 'if-function']
        }
      }
    }
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      failOnError: false
    }
  }
})
