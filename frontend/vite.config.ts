import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Make environment variables available to the client
    'process.env': {}
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy API requests to the backend during development
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Chunk splitting strategy for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-core': ['@mui/material', '@mui/icons-material'],
          'mui-utils': ['@emotion/react', '@emotion/styled', '@mui/x-date-pickers'],
          'form-libs': ['formik', 'axios'],
          'charts': ['recharts'],
          'ui-libs': ['framer-motion', 'antd', 'date-fns'],
          // Module-specific chunks
          'document-module': [
            './src/components/document/DocumentManagementDashboard',
            './src/components/document/DocumentManagementLayout',
            './src/components/document/DocumentLibrary',
            './src/components/document/DocumentDetail',
          ],
          'legal-module': [
            './src/components/legal/ComplianceLayout',
            './src/components/legal/ComplianceDashboard',
            './src/components/legal/ComplianceObligations',
          ],
          'ppe-module': [
            './src/components/ppe/PPEManagementLayout',
            './src/components/ppe/PPEDashboard',
            './src/components/ppe/PPERegister',
          ],
          'audit-module': [
            './src/components/audit/AuditLayout',
            './src/components/audit/AuditDashboard',
          ],
          'risk-module': [
            './src/components/risks/RiskLayout',
            './src/components/risks/RiskDashboard',
            './src/components/risks/RiskRegister',
          ],
          'admin-module': [
            './src/components/admin/AdminLayout',
            './src/components/admin/AdminDashboard',
          ],
        },
      },
    },
    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (disable for smaller bundles)
    sourcemap: false,
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
    ],
  },
})
