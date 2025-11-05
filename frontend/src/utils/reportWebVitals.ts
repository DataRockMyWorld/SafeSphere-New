import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import type { Metric as WebVitalsMetric } from 'web-vitals/attribution';

/**
 * Web Vitals Performance Monitoring
 * 
 * Tracks Core Web Vitals:
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - INP (Interaction to Next Paint) - Interactivity (replaces FID in web-vitals v4)
 * - FCP (First Contentful Paint) - Loading
 * - LCP (Largest Contentful Paint) - Loading
 * - TTFB (Time to First Byte) - Server response
 * 
 * Usage: Call reportWebVitals() in main.tsx
 */

interface WebVitalsReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

const reportMetric = (metric: WebVitalsMetric) => {
  const report: WebVitalsReport = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('🚀 Web Vitals:', report);
  }

  // Send to analytics in production
  if (import.meta.env.PROD) {
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_rating: metric.rating,
      });
    }

    // Example: Send to custom analytics endpoint
    navigator.sendBeacon?.(
      '/api/analytics/web-vitals',
      JSON.stringify(report)
    );
  }
};

const reportWebVitals = () => {
  onCLS(reportMetric);  // Cumulative Layout Shift
  onINP(reportMetric);  // Interaction to Next Paint (replaces FID)
  onFCP(reportMetric);  // First Contentful Paint
  onLCP(reportMetric);  // Largest Contentful Paint
  onTTFB(reportMetric); // Time to First Byte
};

export default reportWebVitals;

/**
 * Performance Budgets (for reference)
 * 
 * Good Thresholds:
 * - LCP: < 2.5s
 * - INP: < 200ms (replaces FID in web-vitals v4)
 * - CLS: < 0.1
 * - FCP: < 1.8s
 * - TTFB: < 800ms
 * 
 * Needs Improvement:
 * - LCP: 2.5s - 4.0s
 * - INP: 200ms - 500ms
 * - CLS: 0.1 - 0.25
 * - FCP: 1.8s - 3.0s
 * - TTFB: 800ms - 1800ms
 * 
 * Poor:
 * - LCP: > 4.0s
 * - INP: > 500ms
 * - CLS: > 0.25
 * - FCP: > 3.0s
 * - TTFB: > 1800ms
 */

