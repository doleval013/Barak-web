---
name: seo-audit
description: SEO audit checklist and optimization guide for improving search rankings
---

# 🔍 SEO Audit & Optimization

This skill provides a comprehensive SEO checklist for improving the website's search engine visibility.

## Target Keywords (Hebrew)

| Priority | Keyword | English Translation |
|----------|---------|---------------------|
| 🎯 High | כלבנות טיפולית | Therapeutic dog training |
| 🎯 High | תוכנית גפ"ן | Gefen program |
| 🎯 Medium | סדנאות כלבים טיפוליים | Therapy dog workshops |
| 🎯 Medium | פעילות העשרה עם כלבים | Enrichment activities with dogs |
| ✅ Done | ברק אלוני | Barak Aloni (brand) |

## SEO Audit Checklist

### 1. Meta Tags (index.html)

```html
<!-- Title: Include primary keyword + brand -->
<title>כלבנות טיפולית | ברק אלוני - סדנאות והעצמה</title>

<!-- Meta Description: 150-160 chars, include keywords -->
<meta name="description" content="ברק אלוני מציע סדנאות כלבנות טיפולית לבתי ספר דרך תוכנית גפ״ן, חברות ולקוחות פרטיים. פעילויות העשרה עם כלבים מאולפים.">

<!-- Keywords (less important but still used) -->
<meta name="keywords" content="כלבנות טיפולית, תוכנית גפן, סדנאות כלבים, ברק אלוני, פעילות העשרה">
```

### 2. Structured Data (JSON-LD)

Add to `index.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "ברק אלוני - כלבנות טיפולית",
  "description": "סדנאות כלבנות טיפולית והעצמה לבתי ספר, חברות ולקוחות פרטיים",
  "url": "https://dogs.barakaloni.com",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IL"
  },
  "areaServed": "Israel",
  "serviceType": ["כלבנות טיפולית", "סדנאות העשרה", "תוכנית גפן"]
}
</script>
```

### 3. Heading Structure

```
H1: One per page, include primary keyword
  └── H2: Section headings (Programs, Contact, etc.)
      └── H3: Subsections (Program names, etc.)
```

**Check:** Only ONE `<h1>` tag exists on the page.

### 4. Image Optimization

- [ ] All images have descriptive `alt` text in Hebrew
- [ ] Images are compressed (WebP format preferred)
- [ ] Lazy loading enabled for below-fold images
- [ ] File names are descriptive (e.g., `therapy-dog-workshop.webp`)

### 5. Technical SEO

- [ ] `robots.txt` allows crawling
- [ ] `sitemap.xml` is up to date
- [ ] Site loads over HTTPS
- [ ] Mobile-responsive (Core Web Vitals)
- [ ] No broken links (404s)
- [ ] Canonical URL is set

### 6. Core Web Vitals

Test at: https://pagespeed.web.dev/

| Metric | Target | How to Improve |
|--------|--------|----------------|
| LCP (Largest Contentful Paint) | < 2.5s | Optimize hero images, preload fonts |
| FID (First Input Delay) | < 100ms | Reduce JS bundle size |
| CLS (Cumulative Layout Shift) | < 0.1 | Set image dimensions, avoid layout shifts |

### 7. Content Optimization

- [ ] Primary keyword appears in first 100 words
- [ ] Keywords appear naturally throughout content
- [ ] Content is unique and valuable
- [ ] Internal links between sections
- [ ] Clear call-to-action buttons

## Tools for SEO Analysis

1. **Google Search Console** - Monitor indexing and search performance
2. **PageSpeed Insights** - Core Web Vitals testing
3. **Ahrefs/SEMrush** - Keyword research (paid)
4. **Screaming Frog** - Technical SEO audit

## Files to Check

| File | What to Check |
|------|---------------|
| `index.html` | Meta tags, JSON-LD, title |
| `public/robots.txt` | Crawl permissions |
| `public/sitemap.xml` | All pages listed |
| `src/components/*.jsx` | Alt text, heading structure |

## After Making Changes

1. Test with PageSpeed Insights
2. Submit sitemap to Google Search Console
3. Request indexing for updated pages
4. Monitor rankings over 2-4 weeks
