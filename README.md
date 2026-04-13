# Lumina - Premium D2C E-commerce Store

A complete, fully functional e-commerce web application built with React, Vite, Firebase, and Cloudinary.

## Tech Stack
- React 19 + Vite
- Firebase v10 (Firestore, Auth)
- Cloudinary (Image Storage)
- React Router v6
- Tailwind CSS + shadcn/ui
- Zustand (State Management)
- React Hook Form + Zod
- Recharts

## 1. Project Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env` file based on `.env.example`
4. Run `npm run dev` to start the development server

## 2. Firebase Project Creation
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps
3. Enable **Firestore Database** (Start in test mode or set up rules)
4. Enable **Authentication** and add **Google** as a sign-in provider
5. Enable **Email/Password** authentication (for Admin login)
6. Go to Project Settings > General > Your apps > Web app
7. Register app and copy the Firebase config keys to your `.env` file

## 3. Cloudinary Setup
1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Go to Settings > Upload > Upload presets
3. Click "Add upload preset"
4. Set "Signing Mode" to **Unsigned**
5. Save and copy the Preset Name to `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env`
6. Copy your Cloud Name from the dashboard to `VITE_CLOUDINARY_CLOUD_NAME` in `.env`

## 4. Admin User Setup
1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter the email address you set in `VITE_ADMIN_EMAIL` (e.g., admin@store.com)
4. Enter a password (e.g., Admin@1234)
5. Click "Add user"
6. You can now log in to the admin panel at `/admin/login`

## 5. Seeding the Database
1. Log in to the Admin Panel (`/admin/login`)
2. Go to the Dashboard (`/admin`)
3. If the products collection is empty, you will see a "Seed Database" button in the top right corner
4. Click "Seed Database" to populate the store with 20 sample products
