# Barak Aloni - Premium Web App

This is a modern, responsive, and premium web application for Barak Aloni's therapeutic dog training business.

## Features

- **Premium Design**: Elegant typography, smooth animations (Framer Motion), and a modern color palette.
- **Responsive**: Fully optimized for mobile, tablet, and desktop.
- **Performance**: Built with Vite and React for blazing fast load times.
- **SEO Friendly**: Semantic HTML and optimized structure.
- **Analytics Ready**: Placeholders for Google Analytics and Facebook Pixel are included in `index.html`.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Locally**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```
    The output will be in the `dist` folder.

## Deployment to AWS

1.  Run `npm run build`.
2.  Upload the contents of the `dist` folder to an AWS S3 bucket configured for Static Website Hosting.
3.  (Optional) Set up CloudFront for HTTPS and faster delivery.

## Configuration

- **Contact Form**: Update the `action` URL in `src/components/Contact.jsx` with your Formspree ID or other backend service.
- **Analytics**: Open `index.html` and paste your Google Analytics and Facebook Pixel scripts in the indicated sections.
