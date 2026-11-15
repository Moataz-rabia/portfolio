import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le dossier dist peut être ouvert depuis n'importe quel sous-dossier.
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
});
