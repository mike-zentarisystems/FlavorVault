'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/firebase';

/** The email address that has admin/impersonation privileges. */
export const ADMIN_EMAIL = 'carolynjuba@gmail.com';

export interface AdminViewState {
  /** The UID whose data is currently being viewed. Use this instead of user.uid in queries. */
  activeUid: string | null;
  /** Whether the current user is an admin. */
  isAdmin: boolean;
  /** The UID the admin has chosen to impersonate. null = viewing own data. */
  impersonatedUid: string | null;
  /** Set the UID to impersonate. Pass null to return to the admin's own data. */
  setImpersonatedUid: (uid: string | null) => void;
}

/**
 * Hook that resolves the "active" user UID for data queries.
 *
 * - For normal users: always returns their own UID.
 * - For admin users (carolynjuba@gmail.com): returns the impersonated UID
 *   if one is set, otherwise their own UID.
 *
 * @example
 * const { activeUid, isAdmin, setImpersonatedUid } = useAdminView();
 * const pantryRef = useMemoFirebase(() =>
 *   activeUid ? collection(firestore, 'users', activeUid, 'pantry') : null,
 *   [firestore, activeUid]
 * );
 */
export function useAdminView(): AdminViewState {
  const { user } = useUser();
  const [impersonatedUid, setImpersonatedUidState] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const setImpersonatedUid = useCallback((uid: string | null) => {
    if (!isAdmin) return; // Safety guard — only admins can switch
    setImpersonatedUidState(uid);
  }, [isAdmin]);

  const activeUid = isAdmin && impersonatedUid ? impersonatedUid : (user?.uid ?? null);

  return {
    activeUid,
    isAdmin,
    impersonatedUid,
    setImpersonatedUid,
  };
}
