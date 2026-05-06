# Firestore Integration Guide

This document explains how Firestore (NoSQL) is used in the Studio project and covers the custom real-time hooks.

## Overview

Firestore is our primary real-time database. It stores user profiles, pantry inventory, and recipe data. All user data is secured via path-based ownership in the Security Rules.

## Data Structure

Data is organized under the following paths:

-   **/users/{userId}**: Root user document.
-   **/users/{userId}/pantry/{ingredientId}**: Individual ingredients in the user's pantry.
-   **/users/{userId}/savedRecipes/{recipeId}**: Recipes saved or created by the user.

## Custom Real-time Hooks

We use custom React hooks to subscribe to Firestore data in real-time. These hooks automatically handle loading states, errors, and unsubscription.

### `useCollection<T>(query)`

Subscribes to a collection or a query.

**IMPORTANT**: The query or reference passed to `useCollection` **must be memoized**. Use `useMemo` or the helper `useMemoFirebase` to ensure stable references.

```typescript
const pantryRef = collection(firestore, `users/${user.uid}/pantry`);
const memoizedQuery = useMemo(() => query(pantryRef, orderBy('name')), [pantryRef]);
const { data, isLoading, error } = useCollection<Ingredient>(memoizedQuery);
```

### `useDoc<T>(docRef)`

Subscribes to a single document.

```typescript
const docRef = doc(firestore, `users/${user.uid}/pantry`, ingredientId);
const memoizedRef = useMemo(() => docRef, [docRef]);
const { data, isLoading, error } = useDoc<Ingredient>(memoizedRef);
```

## Security Rules

Our `firestore.rules` enforces the following:

-   **Signed-in User**: Only authenticated users can access data.
-   **Owner Access**: Data under `/users/{userId}` is strictly limited to the user with the matching `userId`.
-   **Admin Access**: Specific "approved" emails (e.g., `carolynjuba@gmail.com`) can bypass these ownership checks for administrative purposes.

## Best Practices

- Always use the `useCollection` and `useDoc` hooks for real-time updates.
- Ensure all Firestore references and queries are properly memoized to prevent infinite re-renders.
- Use TypeScript interfaces (e.g., `Ingredient`, `Recipe`) when calling hooks for type safety.
