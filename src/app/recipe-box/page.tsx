"use client"

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  BookOpen, 
  Search, 
  FileDown, 
  Loader2, 
  Utensils, 
  Coffee, 
  Sun, 
  Moon, 
  Cookie, 
  IceCream,
  LogIn
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeCard } from '@/components/recipe-card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useGoogleAuth } from '@/hooks/use-google-auth';

const CATEGORIES = [
  { name: 'All', icon: Utensils },
  { name: 'Breakfast', icon: Coffee },
  { name: 'Lunch', icon: Sun },
  { name: 'Dinner', icon: Moon },
  { name: 'Snack', icon: Cookie },
  { name: 'Dessert', icon: IceCream },
];

export default function RecipeBoxPage() {
  const { user, isUserLoading } = useUser();
  const { handleLogin } = useGoogleAuth();
  const firestore = useFirestore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const recipesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'savedRecipes');
  }, [firestore, user]);

  const { data: recipes, isLoading: isRecipesLoading } = useCollection(recipesQuery);

  const handleRemove = (id: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'savedRecipes', id);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Recipe Removed",
      description: "That recipe has been taken out of your collection.",
    });
  };

  const handleExportAll = () => {
    // Trigger directly to prevent pop-up blocking
    window.print();
  };

  const filteredBySearchAndCategory = (recipes || []).filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.ingredientsNeeded.some((ing: string) => ing.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const aiCount = (recipes || []).filter(r => !r.sourceUrl).length;
  const importedCount = (recipes || []).filter(r => r.sourceUrl).length;

  const getStatusText = () => {
    if (!recipes || recipes.length === 0) return "Your personal library of culinary delights.";
    
    if (aiCount > 0 && importedCount > 0) {
      return `You have ${recipes.length} treasures saved (${aiCount} AI-crafted, ${importedCount} imported).`;
    } else if (aiCount > 0) {
      return `You have ${aiCount} AI-crafted ${aiCount === 1 ? 'treasure' : 'treasures'} saved.`;
    } else if (importedCount > 0) {
      return `You have ${importedCount} imported ${importedCount === 1 ? 'treasure' : 'treasures'} saved.`;
    }
    return `You have ${recipes.length} culinary treasures saved.`;
  };

  if (!mounted || isUserLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center space-y-8 max-w-2xl mx-auto">
        <div className="w-32 h-32 rounded-full bg-accent/10 flex items-center justify-center">
          <Heart className="w-16 h-16 text-accent" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Your Recipe Box awaits</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Sign in to access your personal collection of AI-crafted and imported recipes from anywhere.
          </p>
        </div>
        <Button size="lg" onClick={handleLogin} variant="secondary" className="h-14 px-8 text-lg font-bold rounded-2xl gap-3">
          <LogIn className="w-6 h-6" />
          Sign in to view collection
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8 no-print">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full text-accent text-sm font-bold uppercase tracking-widest">
              <Heart className="w-4 h-4" />
              My Collection
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
              Recipe <span className="text-accent italic">Box</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {getStatusText()}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search recipes..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            {recipes && recipes.length > 0 && (
              <Button onClick={handleExportAll} variant="secondary" className="gap-2 rounded-xl">
                <FileDown className="w-4 h-4" />
                Export All PDF
              </Button>
            )}
          </div>
        </div>

        {isRecipesLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : recipes && recipes.length > 0 ? (
          <>
            <Tabs defaultValue="All" className="w-full no-print" onValueChange={setActiveCategory}>
              <TabsList className="bg-muted/50 p-1 h-auto flex flex-wrap justify-start gap-1 mb-8 rounded-2xl">
                {CATEGORIES.map(cat => (
                  <TabsTrigger 
                    key={cat.name} 
                    value={cat.name} 
                    className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 gap-8 pt-4">
              {filteredBySearchAndCategory.map((recipe) => (
                <div key={recipe.id} className="print:mb-12">
                  <RecipeCard 
                    recipe={recipe} 
                    showRemove={true}
                    onRemove={() => handleRemove(recipe.id)}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-muted rounded-3xl opacity-50 bg-white/30 no-print">
            <BookOpen className="w-16 h-16 mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No recipes saved yet</h2>
            <p className="text-muted-foreground text-center max-w-sm">
              Head over to the Kitchen to generate some delicious ideas and save them here for later!
            </p>
            <Button variant="outline" className="mt-8 rounded-full px-8" asChild>
              <a href="/">Go to Kitchen</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
