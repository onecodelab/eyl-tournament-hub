import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Security-hardened Vite configuration.
 * 
 * MobSF Fixes:
 * - H5 (CWE-668): Bind to localhost only, not all interfaces
 * - Security headers added via server configuration
 * - Source maps disabled in production to prevent code exposure
 */
export default defineConfig(({ mode }) => ({
  server: {
    // MobSF Fix: CWE-668 — Only bind to localhost in development
    // Previous: host: "::" (all interfaces = publicly accessible)
    host: "localhost",
    port: 8080,
    // Security headers for dev server
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Disable source maps in production to prevent code exposure
    sourcemap: mode === "development",
    // Drop console statements in production builds
    minify: "terser",
    terserOptions: {
      compress: {
        // MobSF Fix: CWE-532 — Strip console.log/debug in production
        drop_console: mode === "production",
        drop_debugger: true,
      },
    },
  },
}));
