/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { SEOHead } from '../components/seo/SEOHead.js';

describe('Technical & On-Page SEO Suite', () => {
  beforeEach(() => {
    // Reset head elements
    document.title = '';
    const metaTags = document.querySelectorAll('meta, link[rel="canonical"], script[type="application/ld+json"]');
    metaTags.forEach((el) => el.remove());
  });

  describe('SEOHead Component', () => {
    it('sets document title and appends brand suffix when missing', () => {
      render(
        <MemoryRouter initialEntries={['/analyze']}>
          <SEOHead
            title="Analyze & Verify Offer Letter"
            description="Test description for offer letter verification"
            canonicalPath="/analyze"
          />
        </MemoryRouter>
      );

      expect(document.title).toBe('Analyze & Verify Offer Letter | Jaanch AI');
    });

    it('retains explicit brand title if already included in title string', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <SEOHead
            title="Jaanch AI – Digital Trust & Safety Platform for Indian Students"
            description="Test home description"
            canonicalPath="/"
          />
        </MemoryRouter>
      );

      expect(document.title).toBe('Jaanch AI – Digital Trust & Safety Platform for Indian Students');
    });

    it('injects meta description, keywords, canonical link, and Open Graph tags', () => {
      render(
        <MemoryRouter initialEntries={['/resources']}>
          <SEOHead
            title="Official Portals & Resources"
            description="Verify employers on MCA, NCS, and AICTE portals"
            keywords="mca, aicte, ncs"
            canonicalPath="/resources"
          />
        </MemoryRouter>
      );

      const descMeta = document.querySelector('meta[name="description"]');
      expect(descMeta).not.toBeNull();
      expect(descMeta?.getAttribute('content')).toBe('Verify employers on MCA, NCS, and AICTE portals');

      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical).not.toBeNull();
      expect(canonical?.getAttribute('href')).toBe('https://jaanch-mu.vercel.app/resources');

      const ogTitle = document.querySelector('meta[property="og:title"]');
      expect(ogTitle?.getAttribute('content')).toBe('Official Portals & Resources');

      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute('content')).toContain('index, follow');
    });

    it('sets noindex, nofollow on sensitive or private pages', () => {
      render(
        <MemoryRouter initialEntries={['/settings']}>
          <SEOHead
            title="Account Settings"
            description="Private settings"
            noIndex={true}
          />
        </MemoryRouter>
      );

      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow');
    });

    it('injects and cleans up custom page-level JSON-LD schema', () => {
      const customSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://jaanch-mu.vercel.app',
          },
        ],
      };

      const { unmount } = render(
        <MemoryRouter initialEntries={['/sample']}>
          <SEOHead
            title="Samples"
            schema={customSchema}
          />
        </MemoryRouter>
      );

      const scriptTag = document.getElementById('page-specific-jsonld');
      expect(scriptTag).not.toBeNull();
      expect(JSON.parse(scriptTag!.textContent || '{}')).toEqual(customSchema);

      unmount();
      expect(document.getElementById('page-specific-jsonld')).toBeNull();
    });
  });

  describe('Static SEO Configuration Files', () => {
    const clientRoot = fs.existsSync(path.resolve(process.cwd(), 'client/public'))
      ? path.resolve(process.cwd(), 'client')
      : process.cwd();

    it('verifies robots.txt exists and protects sensitive paths', () => {
      const robotsPath = path.resolve(clientRoot, 'public/robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);

      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('User-agent: *');
      expect(content).toContain('Allow: /');
      expect(content).toContain('Disallow: /moderation');
      expect(content).toContain('Disallow: /dashboard');
      expect(content).toContain('Disallow: /history');
      expect(content).toContain('Disallow: /settings');
      expect(content).toContain('Sitemap: https://jaanch-mu.vercel.app/sitemap.xml');
    });

    it('verifies sitemap.xml exists and defines valid XML routes with hreflang', () => {
      const sitemapPath = path.resolve(clientRoot, 'public/sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);

      const xml = fs.readFileSync(sitemapPath, 'utf-8');
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(xml).toContain('https://jaanch-mu.vercel.app/');
      expect(xml).toContain('https://jaanch-mu.vercel.app/analyze');
      expect(xml).toContain('https://jaanch-mu.vercel.app/resources');
      expect(xml).toContain('https://jaanch-mu.vercel.app/about');
      expect(xml).toContain('https://jaanch-mu.vercel.app/privacy');
      expect(xml).toContain('hreflang="hi"');
      expect(xml).toContain('hreflang="kn"');
    });

    it('verifies index.html contains all 4 required JSON-LD schemas and favicons', () => {
      const indexPath = path.resolve(clientRoot, 'index.html');
      expect(fs.existsSync(indexPath)).toBe(true);

      const html = fs.readFileSync(indexPath, 'utf-8');
      expect(html).toContain('rel="icon"');
      expect(html).toContain('rel="apple-touch-icon"');
      expect(html).toContain('property="og:image"');
      expect(html).toContain('name="twitter:card"');
      expect(html).toContain('<title>Internship Scam Detector &amp; Verification Tool | Jaanch</title>');
      expect(html).toContain('internship scam detector');
      expect(html).toContain('fake job offer');
      expect(html).toContain('"@type": "WebSite"');
      expect(html).toContain('"@type": "WebApplication"');
      expect(html).toContain('"@type": "Organization"');
      expect(html).toContain('"@type": "FAQPage"');
      expect(html).toContain('National Cyber Crime Helpline');
    });
  });
});
