# Authentication Guide

This document covers the authentication system used in the Studio project, including Google Sign-In and state management.

## Overview

The authentication system is built on Firebase Auth. It supports Google Sign-In and provides a real-time authentication state to the entire React application via a dedicated provider.

## Google Authentication

Google Sign-In is implemented using the `useGoogleAuth` hook (`src/hooks/use-google-auth.ts`).

### Login Flow

1.  **Sign-In with Popup**: The hook primarily attempts to use `signInWithPopup`. This is the preferred method for a seamless user experience.
2.  **Redirect Fallback**: In some cases, such as when COOP headers block popup communication, the sign-in might fallback to redirect. The hook uses `getRedirectResult` on mount to handle these cases gracefully.

```typescript
export function useGoogleAuth() {
  const auth = useAuth();
  // ...
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      // Handle errors (benign vs. fatal)
    }
  };
  return { handleLogin, isLoggingIn };
}
```

## State Management

The `FirebaseProvider` (`src/firebase/provider.tsx`) manages the authentication state.

- **`useUser()`**: Returns the current `User` object, `isUserLoading` boolean, and any `userError`.
- **`onAuthStateChanged`**: Listen for real-time changes to the authentication state.

## Approved Emails and Roles

The system recognizes certain emails as "approved" or administrative. This is currently managed via the Security Rules in Firestore.

### Current Approved Emails

- `carolynjuba@gmail.com`: Granted administrative access in `firestore.rules`.

Admin users can access and manage data that is otherwise restricted to specific owners.

## Best Practices

- Always use the `useUser` hook to check the current user's sign-in status.
- Show a loading state when `isUserLoading` is true to avoid "flashing" unauthenticated content.
- Use the `isLoggingIn` state from `useGoogleAuth` to disable the login button while a sign-in is in progress.
