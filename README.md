# Lumina - Premium D2C E-commerce Store & AI Virtual Try-On

A complete, fully functional e-commerce web application built with React, Vite, Firebase, Cloudinary, and the Gemini API.

## Tech Stack
- React 19 + Vite
- Firebase v10 (Firestore, Auth)
- Cloudinary (Image Storage)
- Gemini API (AI Virtual Try-On)
- React Router v6
- Tailwind CSS + shadcn/ui
- Zustand (State Management)

## 1. Project Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env` file based on `.env.example` and fill in the required values (Cloudinary & Google OAuth Client ID).
4. Run `npm run dev` to start the development server

## 2. Firebase Configuration
This project uses a `firebase-applet-config.json` file for its Firebase configuration. 
1. Ensure `firebase-applet-config.json` is present in the root directory of the project.
2. If you are setting this up from scratch outside of AI Studio, create this file and add your Firebase config:
```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "(default)"
}
```

## 3. Gemini Connect Setup (For AI Virtual Try-On)
To allow users to use the Virtual Try-On feature with their own Google accounts:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Go to **APIs & Services** > **Credentials**.
3. Create an **OAuth client ID** (Web application).
4. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (or your local dev server URL)
   - Your production URL
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/oauth-redirect.html`
   - `https://your-production-url.com/oauth-redirect.html`
6. Copy the Client ID and paste it into `.env` as `VITE_CLIENT_ID`.

## 4. Cloudinary Setup (For Product Images)
1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Go to Settings > Upload > Upload presets
3. Click "Add upload preset"
4. Set "Signing Mode" to **Unsigned**
5. Save and copy the Preset Name to `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env`
6. Copy your Cloud Name from the dashboard to `VITE_CLOUDINARY_CLOUD_NAME` in `.env`

## 5. Admin Panel Access
1. The admin panel is accessible at `/admin`.
2. To log in, you must use the admin passcode. 
3. The passcode is currently hardcoded as `lumina2026`.
