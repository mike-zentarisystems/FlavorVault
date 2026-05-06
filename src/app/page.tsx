"use client"

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, UtensilsCrossed, ChefHat, LogIn, Utensils, Zap } from 'lucide-react';
import { PantrySidebar } from '@/components/pantry-sidebar';
import { RecipeCard } from '@/components/recipe-card';
import { Button } from '@/components/ui/button';
import { generateRecipeFromPantry } from '@/ai/flows/generate-recipe-from-pantry-flow';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { useAdminView } from '@/firebase/admin-view-context';

const LOADING_MESSAGES = [
  "Sharpening the knives...",
  "Consulting the spice rack...",
  "Balancing the flavors...",
  "Simmering the possibilities...",
  "Plating the ideas...",
  "Adding a dash of inspiration...",
  "Tasting the vision...",
];

export default function FlavorVault() {
  const { user, isUserLoading } = useUser();
  const { handleLogin, isLoggingIn } = useGoogleAuth();
  const { activeUid, isAdmin, impersonatedUid } = useAdminView();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const chefMikeo = PlaceHolderImages.find(img => img.id === 'chef-mikeo');

  const pantryQuery = useMemoFirebase(() => {
    if (!firestore || !activeUid) return null;
    return collection(firestore, 'users', activeUid, 'pantry');
  }, [firestore, activeUid]);

  const { data: pantryItems, isLoading: isPantryLoading } = useCollection(pantryQuery);

  useEffect(() => {
    const pending = sessionStorage.getItem('pending-recipe-import');
    if (pending) {
      try {
        const importedRecipe = JSON.parse(pending);
        setRecipe(importedRecipe);
        sessionStorage.removeItem('pending-recipe-import');
        toast({ 
          title: "Recipe Imported!", 
          description: `Chef Mikeo has parsed ${importedRecipe.title}.` 
        });
      } catch (e) {
        console.error("Failed to parse pending import", e);
      }
    }

    const handleImported = (e: any) => {
      const importedRecipe = e.detail;
      setRecipe(importedRecipe);
      toast({ 
        title: "Recipe Imported!", 
        description: `Chef Mikeo has parsed ${importedRecipe.title}.` 
      });
    };
    
    window.addEventListener('recipe-imported', handleImported);
    return () => window.removeEventListener('recipe-imported', handleImported);
  }, [toast]);

  const handleAddIngredient = (name: string) => {
    // Prevent admin from writing to another user's pantry
    if (!user || !firestore || !activeUid || (isAdmin && impersonatedUid)) return;
    const colRef = collection(firestore, 'users', activeUid, 'pantry');
    addDocumentNonBlocking(colRef, {
      userId: activeUid,
      name,
      quantity: "1",
    });
  };

  const handleRemoveIngredient = (id: string) => {
    // Prevent admin from deleting another user's pantry items
    if (!user || !firestore || !activeUid || (isAdmin && impersonatedUid)) return;
    const docRef = doc(firestore, 'users', activeUid, 'pantry', id);
    deleteDocumentNonBlocking(docRef);
  };

  const handleClearPantry = () => {
    // Prevent admin from wiping another user's pantry
    if (!user || !firestore || !pantryItems || (isAdmin && impersonatedUid)) return;
    pantryItems.forEach((item) => {
      const docRef = doc(firestore, 'users', activeUid!, 'pantry', item.id);
      deleteDocumentNonBlocking(docRef);
    });
    toast({
      title: "Pantry Emptied",
      description: "All items have been removed from your kitchen.",
    });
  };

  const handleGenerateRecipe = async () => {
    if (!pantryItems || pantryItems.length === 0) {
      toast({
        title: "Pantry is empty!",
        description: "Add some ingredients first to get suggestions.",
        variant: "destructive",
      });
      return;
    }

    setRecipe(null);
    setLoading(true);
    try {
      const ingredientNames = pantryItems.map(item => item.name);
      const result = await generateRecipeFromPantry({ ingredients: ingredientNames });
      setRecipe(result);
      toast({
        title: "Recipe Found!",
        description: `Enjoy your ${result.title}!`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Oops!",
        description: "Something went wrong while thinking of a recipe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = (editedRecipe: any) => {
    // Only save to the signed-in user's own collection, never to an impersonated user
    if (!user || !firestore) return;
    const colRef = collection(firestore, 'users', user.uid, 'savedRecipes');
    addDocumentNonBlocking(colRef, {
      ...editedRecipe,
      userId: user.uid,
      savedAt: new Date().toISOString(),
    });
    toast({
      title: "Saved!",
      description: "This recipe has been added to your Recipe Box.",
    });
  };

  // handleLogin and isLoggingIn are provided by useGoogleAuth hook

  if (!mounted || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center space-y-8 max-w-2xl mx-auto">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
          <ChefHat className="w-16 h-16 text-primary" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Welcome to FlavorVault</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Your personal AI chef is waiting. Sign in to start managing your pantry,
            importing recipes, and cooking like a pro.
          </p>
        </div>
        <Button size="lg" onClick={handleLogin} disabled={isLoggingIn} className="h-14 px-8 text-lg font-bold rounded-2xl gap-3">
          {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
          {isLoggingIn ? "Signing In..." : "Get Started with Google"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-background min-h-[calc(100vh-64px)]">
      <div className="w-full md:w-1/3 lg:w-1/4 no-print">
        <PantrySidebar
          ingredients={pantryItems || []}
          onAdd={handleAddIngredient}
          onRemove={handleRemoveIngredient}
          onClearAll={handleClearPantry}
          isLoading={isPantryLoading}
        />
      </div>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="flex flex-col items-center text-center space-y-6 pt-4">
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary bg-muted flex items-center justify-center shadow-2xl transition-all hover:scale-105">
                {chefMikeo && (
                  <Image 
                    src={chefMikeo.imageUrl} 
                    alt={chefMikeo.description} 
                    fill 
                    className="object-cover"
                  />
                )}
              </div>
              {loading && (
                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg animate-bounce">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-bold uppercase tracking-widest">
                <UtensilsCrossed className="w-4 h-4" />
                Chef Mikeo's Kitchen
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-foreground">
                {isAdmin && impersonatedUid
                  ? <>Viewing <span className="text-amber-500">{impersonatedUid.slice(0, 8)}…</span>'s Kitchen</>                  
                  : <>Mamma Mia, <span className="text-primary">{user.displayName?.split(' ')[0]}!</span> What are we <span className="text-primary italic">cooking?</span></>
                }
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                I'm Chef Mikeo, and I'm ready to turn your simple ingredients into a five-star masterpiece. Add your pantry items and let's get to work!
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4 no-print">
            <Button
              size="lg"
              disabled={loading || isPantryLoading}
              onClick={handleGenerateRecipe}
              className="h-16 px-10 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-2xl hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Mikeo is working his magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  What can I make with these?
                </>
              )}
            </Button>
          </div>

          <div className="pt-8 min-h-[400px] transition-all duration-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 py-12">
                <div className="relative">
                  <div className="w-32 h-32 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Utensils className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-2xl font-headline font-bold text-foreground animate-pulse">
                    {LOADING_MESSAGES[loadingMessageIndex]}
                  </p>
                  <p className="text-muted-foreground">The aroma of a new recipe is in the air...</p>
                </div>
              </div>
            ) : recipe ? (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <RecipeCard recipe={recipe} onSave={handleSaveRecipe} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 border-2 border-dashed border-muted rounded-3xl opacity-40 bg-white/30">
                <ChefHatIcon className="w-20 h-20 mb-4 text-muted-foreground" />
                <p className="text-xl font-medium text-muted-foreground">Your culinary journey starts here...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ChefHatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 14c1.1 0 2.1-.4 2.8-1.1.7-.7 1.2-1.7 1.2-2.9 0-2.2-1.8-4-4-4-.3 0-.6.1-.9.1C15.5 4.1 13.9 3 12 3s-3.5 1.1-4.1 2.7c-.3 0-.6-.1-.9-.1-2.2 0-4 1.8-4 4 0 1.2.5 2.2 1.2 2.9.7.7 1.7 1.1 2.8 1.1" />
      <path d="M6 14v1c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-1" />
      <path d="M7 17v3c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-3" />
    </svg>
  );
}
