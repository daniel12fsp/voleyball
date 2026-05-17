import crypto from 'node:crypto'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const PROD_ORIGIN = 'https://daniel12fsp.github.io'

const sha256b64 = (content: string): string => crypto.createHash('sha256').update(content).digest('base64')

const buildIndexMetaAndCsp = (base: string) => {
  return {
    name: 'volei-score:index-meta-csp',
    apply: 'build' as const,
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      const canonical = `${PROD_ORIGIN}${base}`
      const ogImage = `${PROD_ORIGIN}${base}icon.png`

      const seo = `\n    <meta name="description" content="Placar de vôlei offline: toque para pontuar, desfazer, definir meta e reiniciar. Sem anúncios e sem rastreamento." />\n    <meta name="robots" content="index,follow" />\n    <meta name="referrer" content="no-referrer" />\n    <link rel="canonical" href="${canonical}" />\n    <meta property="og:title" content="Volei Score" />\n    <meta property="og:description" content="Placar de vôlei offline: toque para pontuar, desfazer, definir meta e reiniciar. Sem anúncios e sem rastreamento." />\n    <meta property="og:url" content="${canonical}" />\n    <meta property="og:type" content="website" />\n    <meta property="og:image" content="${ogImage}" />\n    <meta property="og:locale" content="pt_BR" />\n    <meta name="twitter:card" content="summary" />\n    <meta name="twitter:image" content="${ogImage}" />\n`

      const withSeo = html.replace(/\n\s*<title>/, `${seo}\n    <title>`)

      // Vite sometimes injects tags in an order that delays CSS/manifest discovery.
      // Reorder to: stylesheet(s) -> module script(s) -> manifest.
      const styleTags = [...withSeo.matchAll(/<link rel="stylesheet"[^>]*>/gi)].map((m) => m[0])
      const scriptTags = [...withSeo.matchAll(/<script type="module"[^>]*><\/script>/gi)].map((m) => m[0])
      const manifestTag = withSeo.match(/<link rel="manifest"[^>]*>/i)?.[0] ?? ''

      let reordered = withSeo
      for (const t of styleTags) reordered = reordered.replace(t, '')
      for (const t of scriptTags) reordered = reordered.replace(t, '')
      if (manifestTag) reordered = reordered.replace(manifestTag, '')

      const headAssets = [...styleTags, ...scriptTags, ...(manifestTag ? [manifestTag] : [])].join('\n    ')
      if (headAssets) reordered = reordered.replace(/<\/head>/i, `\n    ${headAssets}\n  </head>`)

      const inlineScriptHashes: string[] = []
      const inlineStyleHashes: string[] = []

      const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi
      const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi

      for (const m of reordered.matchAll(scriptRe)) inlineScriptHashes.push(`'sha256-${sha256b64(m[1] ?? '')}'`)
      for (const m of reordered.matchAll(styleRe)) inlineStyleHashes.push(`'sha256-${sha256b64(m[1] ?? '')}'`)

      const csp = [
        `default-src 'self'`,
        `base-uri 'none'`,
        `object-src 'none'`,
        `connect-src 'self'`,
        `img-src 'self' data:`,
        `media-src 'self' data:`,
        `worker-src 'self'`,
        `manifest-src 'self'`,
        `style-src 'self' ${inlineStyleHashes.join(' ')}`.trim(),
        `script-src 'self' ${inlineScriptHashes.join(' ')}`.trim(),
      ].join('; ')

      const cspMeta = `\n    <meta http-equiv="Content-Security-Policy" content="${csp}">\n`

      return reordered.replace(/<head>/, `<head>${cspMeta}`)
    },
  }
}

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/voley-score/' : '/'

  return {
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/tests/setup.ts',
      include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/app/**/*.ts', 'src/components/**/*.tsx'],
        exclude: ['src/adapters/**/*.ts'],
        thresholds: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    base,
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', {}]],
        },
      }),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        manifest: {
          name: 'Volei Score',
          short_name: 'Volei',
          start_url: base,
          scope: base,
          display: 'fullscreen',
          orientation: 'landscape',
          background_color: '#0b1022',
          theme_color: '#0b1022',
          lang: 'pt-BR',
          icons: [
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: 'icon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
        workbox: {
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false,
          globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'assets-v1',
                expiration: {
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                  maxEntries: 128,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
      buildIndexMetaAndCsp(base),
    ],
  }
})
