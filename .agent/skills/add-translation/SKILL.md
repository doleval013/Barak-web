---
name: add-translation
description: Add new Hebrew/English translations to the LanguageContext
---

# 🌐 Add Translation

This skill guides the process of adding new translatable strings to the application.

## Translation System

The app uses a custom context-based i18n system:
- **File:** `src/context/LanguageContext.jsx`
- **Hook:** `useLanguage()`
- **Function:** `t(key)` returns translated string

## How to Add a New Translation

### Step 1: Locate the Translations Object

In `src/context/LanguageContext.jsx`, find the `translations` object:

```jsx
const translations = {
  he: {
    // Hebrew translations
    key_name: 'טקסט בעברית',
  },
  en: {
    // English translations
    key_name: 'English text',
  }
};
```

### Step 2: Add New Keys to BOTH Languages

**Important:** Always add to both `he` and `en` objects!

```jsx
const translations = {
  he: {
    // Existing keys...
    new_key: 'טקסט חדש בעברית',
  },
  en: {
    // Existing keys...
    new_key: 'New English text',
  }
};
```

### Step 3: Use in Component

```jsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return <p>{t('new_key')}</p>;
}
```

## Naming Conventions

Use snake_case for keys with descriptive prefixes:

| Prefix | Usage | Example |
|--------|-------|---------|
| `header_` | Header section | `header_contact_us` |
| `hero_` | Hero section | `hero_title` |
| `program_` | Programs section | `program_gefen_title` |
| `contact_` | Contact section | `contact_send_button` |
| `footer_` | Footer section | `footer_privacy` |
| `modal_` | Modal dialogs | `modal_close` |
| `error_` | Error messages | `error_form_required` |
| `success_` | Success messages | `success_form_sent` |
| `btn_` | Button labels | `btn_read_more` |
| `label_` | Form labels | `label_email` |

## ⚠️ Critical Reminder

**DO NOT modify existing Hebrew translations without explicit developer permission!**

The Hebrew content is carefully crafted for the target audience. Only add NEW keys or modify translations when explicitly asked.

## Example: Adding a New Button

```jsx
// In LanguageContext.jsx
const translations = {
  he: {
    // ... existing
    btn_watch_video: 'צפה בסרטון',
  },
  en: {
    // ... existing
    btn_watch_video: 'Watch Video',
  }
};

// In Component
<button>{t('btn_watch_video')}</button>
```

## Checklist

- [ ] Key added to `he` object with Hebrew text
- [ ] Key added to `en` object with English text
- [ ] Key follows naming convention (snake_case with prefix)
- [ ] Component imports `useLanguage` hook
- [ ] Component uses `t('key')` to render text
- [ ] Tested in both Hebrew and English modes

## Finding Untranslated Text

If you see hardcoded strings in a component, they should be moved to translations:

```jsx
// ❌ Bad - Hardcoded
<button>לחץ כאן</button>

// ✅ Good - Translated
<button>{t('btn_click_here')}</button>
```
