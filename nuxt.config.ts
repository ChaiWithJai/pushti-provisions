export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },
  css: ['~/assets/styles/main.scss'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · KO Boxing Library',
      meta: [
        { name: 'description', content: 'A structured training library generated from the canonical KO Boxing Package PDFs.' },
        { name: 'theme-color', content: '#161616' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://i.ytimg.com' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }
      ]
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  }
})
