import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  noIndex?: boolean;
  schema?: Record<string, any>;
}

const DEFAULT_BASE_URL = 'https://jaanch-mu.vercel.app';
const DEFAULT_TITLE = 'Jaanch AI – Digital Trust & Safety Platform for Indian Students | Scam Verification';
const DEFAULT_DESC =
  'Free, privacy-first scam verification for Indian students and job seekers. Instantly verify internship offer letters, fake recruiters, upfront deposit traps, and scholarship fraud across MCA, AICTE, and NCS official portals.';
const DEFAULT_KEYWORDS =
  'fake internship check, job scam detector India, internship letter verification, laptop security deposit scam, scholarship fraud check, AICTE internship verification, MCA company check, 1930 cyber crime helpline, Indian student safety';
const DEFAULT_OG_IMAGE = `${DEFAULT_BASE_URL}/og-image.jpg`;

export function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  schema,
}: SEOHeadProps) {
  const location = useLocation();
  const currentPath = canonicalPath || location.pathname;
  const canonicalUrl = `${DEFAULT_BASE_URL}${currentPath === '/' ? '' : currentPath}`;

  useEffect(() => {
    // 1. Update Title
    document.title = title.includes('Jaanch') ? title : `${title} | Jaanch AI`;

    // 2. Helper to set or create meta tag
    const setMeta = (nameOrProperty: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(`meta[${nameOrProperty}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameOrProperty, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Primary Meta Tags
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta(
      'name',
      'robots',
      noIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );

    // 4. Canonical Link Tag
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 5. Open Graph / Facebook / LinkedIn
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:image', ogImage);

    // 6. Twitter / X Cards
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    // 7. Dynamic JSON-LD Structured Data
    const scriptId = 'page-specific-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) {
        tag.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, noIndex, schema]);

  return null;
}

export default SEOHead;
