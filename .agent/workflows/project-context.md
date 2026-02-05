---
description: Project context and system prompt for Barak Aloni Therapy Dog Website
---

# 🐕 Barak Aloni – Therapy Dog Website | Project Context

---

## ⚠️ CRITICAL RULES - READ FIRST

### 1. Content is in Hebrew - Do NOT Modify Without Permission
The website content (text, labels, titles, descriptions) is written in **Hebrew** because the target audience's native language is Hebrew. 

**🚫 DO NOT:**
- Change, rename, or "improve" any Hebrew text content
- Modify button labels, titles, or descriptions
- Translate content to English (unless explicitly requested)
- "Fix" or alter any naming conventions in the UI

**✅ DO:**
- Keep all existing Hebrew content exactly as-is
- Ask before making ANY content/naming changes
- Only modify content when explicitly requested by the developer

### 2. Code vs Content Distinction
| Type | Language | Can Modify? |
|------|----------|-------------|
| Code (variables, functions, comments) | English | ✅ Yes |
| UI Content (text, labels, translations) | Hebrew | ❌ Only if asked |
| File names | English | ✅ Yes |
| Commit messages | English | ✅ Yes |

---

## Business Overview

**Website:** [dogs.barakaloni.com](https://dogs.barakaloni.com)  
**Business Owner:** Barak Aloni  
**Service:** Therapy Dog Workshops & Empowerment Activities

### What Barak Does
Barak conducts and manages projects with dog trainers to perform enriching activities that enhance people's experiences and brighten their days. Activities include:

1. **Schools (via גפ"ן / Gefen)** - Educational institutions can procure Barak's services through the Gefen government budget system
2. **Private Companies** - Corporate team-building and wellness workshops
3. **Direct Clients** - Individual sessions and private events

### Understanding גפ"ן (Gefen)
**גפ"ן** (Gefen - גמישות ניהולית) is the Israeli Ministry of Education's flexible management budget system. It allows school principals and local authorities to:
- Manage their allocated budget
- Procure educational services and programs
- Plan and execute tailored educational activities

Schools can hire Barak's therapy dog services through this system, making it a key acquisition channel.

---

## Team & Roles

| Role | Person | Notes |
|------|--------|-------|
| Business Owner | Barak Aloni | Provides content, videos, requirements |
| Web Developer | Dolev (You) | Full-stack development, DevOps, infrastructure |

---

## Tech Stack

### Frontend (Barak-web/)
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI Framework |
| Vite | 7 | Build tool & dev server |
| Tailwind CSS | v4 | Styling |
| Framer Motion | 12.x | Animations |
| Lottie React | 2.x | Complex SVG animations |
| Lucide React | Latest | Icons |
| Recharts | 3.x | Dashboard charts |
| date-fns | 4.x | Date formatting |

### Backend (Barak-web/backend/)
| Technology | Purpose |
|------------|---------|
| Express.js | API server |
| PostgreSQL (pg) | Analytics database |
| geoip-lite | Visitor geolocation |
| ua-parser-js | Device/browser detection |
| cors | Cross-origin requests |

### Infrastructure
| Component | Details |
|-----------|---------|
| Cloud | AWS (Tel Aviv region) |
| Compute | EC2 t3.small (30GB storage) |
| Load Balancer | Application Load Balancer (ALB) |
| Kubernetes | K3s (single-node cluster) |
| CI/CD | GitHub Actions → Docker Hub → ArgoCD |
| TLS | Let's Encrypt via cert-manager |
| Ingress | NGINX Ingress Controller |
| Monthly Cost | ~$50 (goal: reduce this) |

---

## Repository Structure

```
Barak-web/                        # Main Application (this repo)
├── src/
│   ├── App.jsx                   # Main app, routing, visit tracking
│   ├── components/
│   │   ├── Header.jsx            # Dynamic scroll-aware header
│   │   ├── Hero.jsx              # Hero with paw animations
│   │   ├── Programs.jsx          # Program cards with lightbox
│   │   ├── ProgramModal.jsx      # Program details modal
│   │   ├── Contact.jsx           # Formspree contact form
│   │   ├── AdminDashboard.jsx    # Protected analytics (/admin)
│   │   ├── AccessibilityWidget.jsx
│   │   ├── CookieBanner.jsx
│   │   ├── LegalModal.jsx
│   │   ├── FloatingWhatsApp.jsx
│   │   └── Footer.jsx
│   ├── context/
│   │   └── LanguageContext.jsx   # i18n (Hebrew/English)
│   └── index.css                 # Tailwind + custom styles
├── backend/
│   ├── index.js                  # Express API (analytics)
│   ├── Dockerfile
│   └── package.json
├── public/
│   ├── assets/                   # Images, Lottie JSON
│   ├── robots.txt
│   └── sitemap.xml
├── .github/workflows/
│   └── ci-cd.yml                 # Build & deploy pipeline
├── Dockerfile                    # Frontend (Nginx)
├── nginx.conf
└── docker-compose.yml            # Local development

# Separate Infrastructure Repo (Barak-web-Infra/)
├── k8s/
│   ├── app.yaml                  # All K8s resources
│   ├── secrets.yaml              # DB creds, admin hash
│   └── issuer.yaml               # cert-manager ClusterIssuer
└── argocd/
    └── barak-web-app.yaml        # ArgoCD Application
```

---

## Key Features

### 1. Self-Hosted Analytics (Data-Driven Decisions)
The owner values data for decision-making. The backend tracks:
- **Visits**: Page views, session duration (heartbeat), unique visitors
- **Geolocation**: City/Country via IP (geoip-lite)
- **Device Info**: Browser, OS, device type (ua-parser-js)
- **Events**: Video clicks, program views, contact interactions
- **Referrers**: Traffic sources
- **Time-based trends**: 24h, 7d, 30d analytics

Access via `/admin` route (password protected via ADMIN_HASH).

### 2. Multilingual Support
- Primary: Hebrew (RTL)
- Secondary: English (LTR)
- Handled via `LanguageContext.jsx` with `t()` function and `toggleLanguage()`

### 3. Accessibility
- AccessibilityWidget component
- ARIA labels throughout
- Semantic HTML
- Keyboard navigation support

### 4. Cookie Consent & Legal
- GDPR-style cookie banner
- Legal modals (Privacy, Terms, Accessibility statement)

---

## Design Guidelines

### Color Palette
- **Primary**: Blue tones (Barak's preference)
- **Secondary**: White
- **Style**: Glassmorphism, modern, premium feel
- **Animations**: Framer Motion for micro-interactions

### Design Principles
1. **Eye-catching**: Premium, "wow factor" on first impression
2. **Interactive**: Scroll-triggered animations, hover effects
3. **Responsive**: Mobile-first, works on all devices
4. **Accessible**: WCAG compliance goals

---

## Development Workflow

### Local Development
```bash
npm install
npm run dev          # Frontend on http://localhost:5173
```

### Deployment Flow
1. Make changes and commit
2. Create a version tag: `git tag v1.5.1 && git push --tags`
3. GitHub Actions builds Docker images (frontend + backend)
4. CI updates `Barak-web-Infra/k8s/app.yaml` with new image tags
5. ArgoCD detects change and syncs to K3s cluster

### Important Paths
- Frontend API calls: `/api/*` → Backend service
- Admin Dashboard: `/admin`
- Health check: `/health`

---

## Current Goals & Priorities

### Active Development
1. **Enhanced Scroll Animations** - Make the site more interactive as users scroll
2. **Better UX** - Improve overall experience and visual appeal
3. **Government Browser Compatibility** - Site is blocked on some government networks (needs investigation)

### SEO Goals (High Priority for ROI)
The website is currently found only when searching for the brand name. The goal is to rank for **service-based keywords** to increase organic discovery and ROI.

| Status | Keyword | Notes |
|--------|---------|-------|
| ✅ Working | ברק אלוני | Brand name - already ranking |
| 🎯 Target | כלבנות טיפולית | "Therapeutic dog training" - primary service keyword |
| 🎯 Target | תוכנית גפ"ן | "Gefen program" - schools searching for providers |
| 🎯 Target | סדנאות כלבים טיפוליים | "Therapy dog workshops" |
| 🎯 Target | פעילות העשרה עם כלבים | "Enrichment activities with dogs" |

**SEO Strategy:**
- Optimize meta tags, titles, and descriptions for target keywords
- Add structured data (JSON-LD) for local business
- Create content around Gefen program integration
- Improve page speed and Core Web Vitals
- Build internal linking structure

### Future Considerations
- Cost optimization (currently ~$50/month AWS)
- E2E testing review (Playwright tests exist but need review)
- Potential additional websites on same K3s cluster

---

## Known Issues & Technical Debt

1. **Government Browser Blocking** - Unknown cause, needs investigation
2. **Testing** - Playwright tests exist but need review
3. **Local Secrets** - No .env files currently; secrets only in K8s

---

## Code Standards

- **Language**: All code, comments, and commit messages in **English**
- **IDE**: Antigravity
- **Formatting**: ESLint configured
- **Framework conventions**: React hooks, functional components

---

## Quick Reference

### Common Commands
```bash
# Development
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run lint         # ESLint check

# Docker
docker-compose up    # Local containers

# Deployment
git tag v1.x.x && git push --tags  # Trigger CI/CD
```

### Important URLs
| URL | Purpose |
|-----|---------|
| https://dogs.barakaloni.com | Production site |
| https://dogs.barakaloni.com/admin | Analytics dashboard |
| /api/visit | Track page visits |
| /api/stats | Get analytics (protected) |

### Environment Variables (Backend)
| Variable | Description |
|----------|-------------|
| DB_HOST | PostgreSQL host |
| DB_USER | Database user |
| DB_PASSWORD | Database password |
| DB_NAME | Database name |
| ADMIN_HASH | SHA256 hash of admin password |
| APP_VERSION | Current deployed version |
| GIT_COMMIT | Current deployed commit |

---

## Contact & Resources

- **Domain**: dogs.barakaloni.com
- **Docker Hub**: doleval013/barak-web, doleval013/barak-web-backend
- **GitHub**: doleval013/Barak-web, doleval013/Barak-web-Infra
