import { defineConfig, type IndexHtmlTransformContext } from 'vite';
import react from '@vitejs/plugin-react';

const basePath = process.env.VITE_BASE_PATH || '/';

function himavatHtmlOptimizePlugin() {
  return {
    name: 'himavat-html-optimize',
    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string) {
        return html.replace(/__BASE__/g, basePath);
      },
    },
  };
}

function inlineSmallCssPlugin() {
  return {
    name: 'himavat-inline-css',
    enforce: 'post' as const,
    transformIndexHtml(html: string, ctx?: IndexHtmlTransformContext) {
      if (!ctx?.bundle) return html;
      let out = html;
      for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
        if (fileName.endsWith('.css') && chunk.type === 'asset') {
          const css = String(chunk.source);
          const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const linkRe = new RegExp(`<link[^>]*rel="stylesheet"[^>]*href="[^"]*${escaped}"[^>]*>`, 'i');
          if (linkRe.test(out)) {
            out = out.replace(linkRe, `<style>${css}</style>`);
            delete ctx.bundle[fileName];
          }
        }
      }
      return out;
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [react(), himavatHtmlOptimizePlugin(), inlineSmallCssPlugin()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    modulePreload: {
      resolveDependencies(_url: string, deps: string[]) {
        return deps.filter(
          (d) =>
            !d.includes('motion-vendor') &&
            !d.includes('webgl-vendor') &&
            !d.includes('lottie_light'),
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) {
            return 'motion-vendor';
          }
          if (id.includes('node_modules/ogl') || id.includes('node_modules/detect-gpu')) {
            return 'webgl-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
