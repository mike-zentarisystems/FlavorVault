# Firebase Integration Guide

This document provides an overview of how Firebase is integrated into the Studio project.

## Overview

Studio uses Firebase for several key features:
- **Authentication**: Managed via Google Sign-In and email/password.
- **Firestore**: A NoSQL real-time database used to store user data, pantry inventory, and saved recipes.
- **App Hosting**: Production environment integrated with automatic Firebase initialization.

## Setup and Configuration

### Environment Variables

For development, Firebase is configured using the `firebaseConfig` object in `src/firebase/config.ts`. In production (Firebase App Hosting), initialization is handled automatically.

### Initialization Logic

The core initialization logic resides in `src/firebase/index.ts`. It attempts to initialize Firebase without arguments (for App Hosting compatibility) and falls back to a manual configuration object for local development.

```typescript
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Automatic initialization via Firebase App Hosting
      firebaseApp = initializeApp();
    } catch (e) {
      // Fallback for development
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}
```

## Security Rules

### Approved Emails

The project enforces security rules defined in `firestore.rules`. Specifically, it supports the concept of "approved" or administrative emails that have broader access to the data.

Currently, the following emails are recognized as administrators:
- `carolynjuba@gmail.com`

This is defined by the `isAdmin()` function in `firestore.rules`:

```javascript
function isAdmin() {
  return isSignedIn() && request.auth.token.email == 'carolynjuba@gmail.com';
}
```

### Data Ownership

By default, all user data is nested under `/users/{userId}`. Users can only read and write their own data, verified by `request.auth.uid`.

## Best Practices

- Always use the `useFirebase` or specific service hooks (`useFirestore`, `useAuth`) within the `FirebaseProvider`.
- Real-time subscriptions should be managed via the `useCollection` and `useDoc` hooks.

---

## Deployment (Firebase App Hosting)

This project uses **Firebase App Hosting** (not Firebase Hosting Classic), which supports full-stack Next.js with SSR.

### Steps to Deploy

1. **Connect the GitHub repo** in the [Firebase Console](https://console.firebase.google.com) under App Hosting → Create backend.

2. **Set the custom domain** `flavorvault.zentarisystems.io` in App Hosting → Domains. Firebase provisions an SSL certificate automatically.

3. **Add secret environment variables** via [Firebase Secret Manager](https://console.cloud.google.com/security/secret-manager) — do **not** commit `.env` files. Reference them in `apphosting.yaml` like:
   ```yaml
   env:
     - variable: MY_SECRET
       secret: my-secret-name
   ```

4. **Push to your connected branch** — Firebase App Hosting auto-builds and deploys on each push. No manual `firebase deploy` needed.

### Port Note

The dev server runs on `:9002` locally (set in `package.json`). Firebase App Hosting serves on HTTPS port **443** automatically — no port configuration required.
