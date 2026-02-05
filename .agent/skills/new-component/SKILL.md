---
name: new-component
description: Create a new React component following project patterns and conventions
---

# 🧩 Create New React Component

This skill guides the creation of new React components following the project's established patterns.

## Component Structure

All components live in: `src/components/`

## Template

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
// Import icons from lucide-react as needed
// import { IconName } from 'lucide-react';

function ComponentName({ prop1, prop2 }) {
  const { t, language } = useLanguage();
  const isRTL = language === 'he';

  // State
  const [exampleState, setExampleState] = useState(null);

  // Effects
  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup logic
    };
  }, []);

  // Handlers
  const handleClick = () => {
    // Handle click
  };

  return (
    <section
      id="component-id"
      className="py-16 px-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Component content */}
      </motion.div>
    </section>
  );
}

export default ComponentName;
```

## Conventions

### 1. File Naming
- PascalCase: `ComponentName.jsx`
- One component per file

### 2. Translations
Always use the `t()` function for user-facing text:
```jsx
const { t } = useLanguage();
// Usage: {t('key_name')}
```

**Remember:** Add new keys to `LanguageContext.jsx` (use the `add-translation` skill).

### 3. RTL Support
```jsx
const { language } = useLanguage();
const isRTL = language === 'he';

// Apply to containers:
<div dir={isRTL ? 'rtl' : 'ltr'}>
```

### 4. Animations (Framer Motion)
Common patterns:
```jsx
// Fade in on scroll
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>

// Hover effects
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>

// Staggered children
<motion.div variants={containerVariants}>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={itemVariants}
      custom={i}
    />
  ))}
</motion.div>
```

### 5. Styling
Use Tailwind CSS classes. Common patterns:
```jsx
// Glass effect
className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg"

// Responsive padding
className="px-4 md:px-8 lg:px-16"

// Blue accent (brand color)
className="text-blue-600 bg-blue-50 hover:bg-blue-100"
```

### 6. Analytics Events
If the component has trackable interactions:
```jsx
const trackEvent = async (type, name, metadata = {}) => {
  if (process.env.NODE_ENV === 'development') return;
  try {
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, metadata })
    });
  } catch (err) {
    console.error('Event tracking failed:', err);
  }
};
```

## Checklist

- [ ] Component file created in `src/components/`
- [ ] PascalCase naming
- [ ] Uses `useLanguage` hook for translations
- [ ] RTL support with `dir` attribute
- [ ] Framer Motion animations added
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (aria-labels, semantic HTML)
- [ ] Import added to parent component (usually `App.jsx`)

## Example Components to Reference

| Component | Good Example Of |
|-----------|-----------------|
| `Hero.jsx` | Complex animations, Lottie |
| `Programs.jsx` | Card layout, modals, lightbox |
| `Contact.jsx` | Form handling, Formspree |
| `Header.jsx` | Scroll effects, sticky positioning |
| `AdminDashboard.jsx` | Data fetching, charts |
