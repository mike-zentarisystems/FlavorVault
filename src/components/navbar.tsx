"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChefHat, ShoppingCart, Heart, UtensilsCrossed, LogOut, User as UserIcon, LogIn, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImportRecipeDialog } from '@/components/import-recipe-dialog';
import { ImportRecipeOutput } from '@/ai/flows/import-recipe-flow';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useGoogleAuth } from '@/hooks/use-google-auth';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const { handleLogin, isLoggingIn } = useGoogleAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: 'Kitchen', href: '/', icon: UtensilsCrossed },
    { label: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
    { label: 'Recipe Box', href: '/recipe-box', icon: Heart },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "Come back soon!" });
      router.push('/');
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" });
    }
  };

  const handleImportSuccess = (recipe: ImportRecipeOutput) => {
    sessionStorage.setItem('pending-recipe-import', JSON.stringify(recipe));
    if (pathname !== '/') {
      router.push('/');
    } else {
      const event = new CustomEvent('recipe-imported', { detail: recipe });
      window.dispatchEvent(event);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <ChefHat className="w-8 h-8" />
            <span className="hidden sm:inline-block tracking-tight font-headline">FlavorVault</span>
          </Link>
          
          <div className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {mounted ? (
            <div className="flex items-center gap-3">
              {/* Import tool sits to the left of the user section */}
              <ImportRecipeDialog onImportSuccess={handleImportSuccess} />

              <div className="h-8 w-px bg-border hidden sm:block" />

              {/* User Section on the far right */}
              <div className="flex items-center gap-3 min-w-[120px] justify-end">
                {isUserLoading || isLoggingIn ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : user ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <UserIcon className="w-4 h-4" />
                      <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0]}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleLogin} className="gap-2 rounded-full font-bold shadow-sm whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground">
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-10 w-48 bg-muted/20 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </nav>
  );
}
