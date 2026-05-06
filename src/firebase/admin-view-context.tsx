'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useUser } from '@/firebase';

export const ADMIN_EMAIL = 'carolynjuba@gmail.com';

interface AdminViewContextValue {
  activeUid: string | null;
  isAdmin: boolean;
  impersonatedUid: string | null;
  setImpersonatedUid: (uid: string | null) => void;
}

const AdminViewContext = createContext<AdminViewContextValue | undefined>(undefined);

/**
 * Provides admin impersonation state to the full component tree.
 * Must be rendered inside FirebaseClientProvider (so useUser is available).
 */
export function AdminViewProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [impersonatedUid, setImpersonatedUidState] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const setImpersonatedUid = useCallback((uid: string | null) => {
    if (!isAdmin) return;
    setImpersonatedUidState(uid);
  }, [isAdmin]);

  // If admin has chosen a UID, use that; otherwise fall back to own UID
  const activeUid = isAdmin && impersonatedUid ? impersonatedUid : (user?.uid ?? null);

  return (
    <AdminViewContext.Provider value={{ activeUid, isAdmin, impersonatedUid, setImpersonatedUid }}>
      {children}
    </AdminViewContext.Provider>
  );
}

/**
 * Consume admin view state anywhere in the tree.
 * For normal users: activeUid === their own uid, isAdmin === false.
 * For carolynjuba@gmail.com: activeUid can be any user's UID.
 */
export function useAdminView(): AdminViewContextValue {
  const ctx = useContext(AdminViewContext);
  if (!ctx) throw new Error('useAdminView must be used within AdminViewProvider');
  return ctx;
}
