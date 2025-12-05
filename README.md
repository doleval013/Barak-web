# Barak Aloni – Therapeutic Dog Training Website

A premium, responsive, and high-performance single-page application (SPA) built for Barak Aloni's therapeutic dog training business. This project showcases modern web development practices with a focus on aesthetics, user experience, and accessibility.

![Project Banner](public/assets/BARAK-ALONI-logo-1024x319.png)

## 🚀 Key Features

*   **Modern Technology Stack**: Built with React 19, Vite, and Tailwind CSS v4.
*   **Premium Design**: Features a glassmorphism aesthetic, custom animations powered by Framer Motion, and a carefully curated color palette.
*   **Responsive & Accessible**: Fully optimized for all device sizes (Mobile, Tablet, Desktop) and includes accessibility features like `aria-labels` and semantic markup.
*   **Interactive Components**:
    *   **Dynamic Header**: Smooth scroll effects with a transforming logo (connected component logic).
    *   **Image Gallery**: Interactive lightbox for viewing program highlights.
    *   **Contact Form**: Integrated with Formspree for handling user inquiries.
    *   **Social Media Integration**: Prominent, brand-colored social links for Facebook, Instagram, TikTok, and YouTube.
*   **Performance Optimized**: Fast load times, optimized assets, and best-practice coding standards.

## 🛠️ Tech Stack

*   **Framework**: [React](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/barak-web.git
    cd barak-web
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## ⚙️ Configuration

### Contact Form
This project uses **Formspree** to handle form submissions.
1.  Go to [Formspree](https://formspree.io/) and create a new form.
2.  Open `src/components/Contact.jsx`.
3.  Replace the placeholder URL in the `<form>` `action` attribute with your unique Formspree endpoint:
    ```jsx
    action="https://formspree.io/f/YOUR_FORM_ID"
    ```

### Analytics
To add Google Analytics or Facebook Pixel:
1.  Open `index.html`.
2.  Paste your script tags in the `<head>` or `<body>` sections as indicated by the comments.

## 🚀 Deployment

This project is ready to be deployed to any static hosting service.

### Build via Command Line
To create a production build:
```bash
npm run build
```
This will generate a `dist` folder containing your optimized assets.

### Deploying to Netlify / Vercel / AWS Amplify
1.  Connect your Git repository.
2.  Set the **Root Directory** to: `.` (or leave empty)
3.  Set the **Build Command** to: `npm run build`
4.  Set the **Output Directory** (Publish Directory) to: `dist`

## 🔒 Security Note
*   **Git Safety**: The `.gitignore` file is configured to exclude `node_modules`, `dist`, logs, and environment files (`.env`).
*   **No Secrets**: Ensure you do not commit real API keys or tokens directly into the code. Use environment variables if expanding the backend functionality.

---
*Built with ❤️ for Barak Aloni*
