'use client';

import { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, getRedirectResult } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

/**
 * Shared hook for Google Sign-In that:
 * 1. Uses signInWithPopup (preferred, requires COOP header)
 * 2. Handles getRedirectResult on mount
 * 3. Manages the isLoggingIn loading state cleanly
 */
export function useGoogleAuth() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          toast({
            title: 'Signed In',
            description: `Welcome back, ${result.user.displayName?.split(' ')[0] || 'Chef'}!`,
          });
        }
      })
      .catch((error: any) => {
        if (error?.code && error.code !== 'auth/no-auth-event') {
          console.error('Redirect sign-in error:', error);
          toast({
            title: 'Login Failed',
            description: error.message || 'Could not complete sign-in.',
            variant: 'destructive',
          });
        }
      });
  }, [auth, toast]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Signed In', description: 'Welcome to FlavorVault!' });
    } catch (error: any) {
      const benign = [
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
      ];
      if (!benign.includes(error?.code)) {
        let description = error.message || 'Could not sign in. Please try again.';
        
        // Specific guidance for workstation domain authorization issues
        if (error?.code === 'auth/unauthorized-domain') {
          description = "This domain is not authorized. Please add your current URL to 'Authorized Domains' in the Firebase Console.";
        }

        toast({
          title: 'Login Failed',
          description,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return { handleLogin, isLoggingIn };
}