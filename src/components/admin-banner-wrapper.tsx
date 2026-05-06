'use client';

/**
 * A thin wrapper that reads admin state from context and renders
 * the AdminBanner only when the signed-in user is the admin.
 * Lives in layout.tsx so it is always visible, app-wide.
 */
import { AdminBanner } from '@/components/admin-banner';
import { useAdminView } from '@/firebase/admin-view-context';

export function AdminBannerWrapper() {
  const { isAdmin, impersonatedUid, setImpersonatedUid } = useAdminView();

  if (!isAdmin) return null;

  return (
    <AdminBanner
      impersonatedUid={impersonatedUid}
      onSetUid={setImpersonatedUid}
    />
  );
}
