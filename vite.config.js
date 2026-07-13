import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const firebaseConfigFallbackPlugin = {
  name: 'firebase-config-fallback',
  resolveId(id) {
    if (id.endsWith('firebase-applet-config.json')) {
      const fullPath = path.resolve(__dirname, 'firebase-applet-config.json');
      if (!fs.existsSync(fullPath)) {
        return 'virtual:firebase-applet-config.json';
      }
    }
    return null;
  },
  load(id) {
    if (id === 'virtual:firebase-applet-config.json') {
      return JSON.stringify({
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
        firestoreDatabaseId: ""
      });
    }
    return null;
  }
};

// ⚠️  Change 'my-roadmap' below to match your GitHub repository name exactly
// Example: if your repo is github.com/sreeshanth/engineering-roadmap
//          set base to '/engineering-roadmap/'
export default defineConfig(({ command }) => ({
  plugins: [react(), firebaseConfigFallbackPlugin],
  base: command === 'serve' ? '/' : './',
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all'
  }
}))
