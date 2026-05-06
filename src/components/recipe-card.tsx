"use client"

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ChefHat, 
  Heart, 
  ExternalLink, 
  Youtube, 
  FileDown, 
  Trash2, 
  Utensils,
  Coffee,
  Sun,
  Moon,
  Cookie,
  IceCream,
  Edit2,
  Save,
  X,
  StickyNote,
  User,
  Mail
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface RecipeCardProps {
  recipe: any;
  onSave?: (editedRecipe: any) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function RecipeCard({ recipe, onSave, onRemove, showRemove = false }: RecipeCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(recipe.title);
  const [editedNotes, setEditedNotes] = useState(recipe.notes || '');
  const [editedChefName, setEditedChefName] = useState(recipe.chefName || '');

  useEffect(() => {
    setEditedTitle(recipe.title);
    setEditedNotes(recipe.notes || '');
    setEditedChefName(recipe.chefName || '');
  }, [recipe]);

  const isYoutube = recipe.sourceUrl?.includes('youtube.com') || recipe.sourceUrl?.includes('youtu.be');

  const handlePrint = () => {
    // Direct synchronous call to ensure browser doesn't block the dialog
    window.print();
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`FlavorVault Recipe: ${editedTitle}`);
    const ingredients = recipe.ingredientsNeeded.map((ing: string) => `- ${ing}`).join('\n');
    const instructions = recipe.instructions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n\n');
    const notes = editedNotes ? `\n\nMY NOTES:\n${editedNotes}` : '';
    const chefInfo = editedChefName ? `Created by: ${editedChefName}\n` : '';
    
    const body = encodeURIComponent(
      `Check out this recipe I found on FlavorVault!\n\n` +
      `TITLE: ${editedTitle}\n` +
      `${chefInfo}` +
      `PREP TIME: ${recipe.prepTime}\n\n` +
      `INGREDIENTS:\n${ingredients}\n\n` +
      `INSTRUCTIONS:\n${instructions}${notes}\n\n` +
      `View on FlavorVault: https://flavorvault.zentarisystems.io`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleUpdate = () => {
    if (!user || !recipe.id || !firestore) return;

    const docRef = doc(firestore, 'users', user.uid, 'savedRecipes', recipe.id);
    updateDocumentNonBlocking(docRef, {
      title: editedTitle,
      notes: editedNotes,
      chefName: editedChefName
    });

    setIsEditing(false);
    toast({
      title: "Recipe Updated",
      description: "Your changes have been saved to the Recipe Box.",
    });
  };

  const handleSaveToBox = () => {
    if (onSave) {
      onSave({
        ...recipe,
        title: editedTitle,
        notes: editedNotes,
        chefName: editedChefName || undefined
      });
    }
  };

  const getCategoryConfig = (category?: string) => {
    switch (category) {
      case 'Breakfast': return { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Coffee };
      case 'Lunch': return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Sun };
      case 'Dinner': return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Moon };
      case 'Snack': return { color: 'bg-green-100 text-green-700 border-green-200', icon: Cookie };
      case 'Dessert': return { color: 'bg-pink-100 text-pink-700 border-pink-200', icon: IceCream };
      default: return { color: 'bg-muted text-muted-foreground', icon: Utensils };
    }
  };

  const config = getCategoryConfig(recipe.category);
  const CategoryIcon = config.icon;

  return (
    <Card className="max-w-3xl mx-auto overflow-hidden shadow-xl border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-4 duration-500 card">
      <CardHeader className="bg-gradient-to-b from-primary/5 to-transparent pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-primary">
                <div className="flex items-center gap-1">
                  <ChefHat className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {recipe.sourceUrl ? 'Imported' : 'Kitchen AI'}
                  </span>
                </div>
                {recipe.category && (
                  <Badge variant="outline" className={cn("no-print", config.color)}>
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {recipe.category}
                  </Badge>
                )}
                {recipe.category && (
                  <div className="hidden print:inline-flex items-center border px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {recipe.category}
                  </div>
                )}
              </div>
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="h-8 px-2 gap-2 text-muted-foreground hover:text-primary no-print"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3 mt-2 no-print">
                <Input 
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-xl font-headline font-bold bg-white"
                  placeholder="Recipe Title"
                />
                <Input 
                  value={editedChefName}
                  onChange={(e) => setEditedChefName(e.target.value)}
                  className="text-sm bg-white"
                  placeholder="Chef Name (optional)"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <CardTitle className="text-3xl font-headline text-foreground leading-tight">
                  {editedTitle}
                </CardTitle>
                {editedChefName && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                    <User className="w-3.5 h-3.5" />
                    <span>by <span className="text-foreground font-bold">{editedChefName}</span></span>
                  </div>
                )}
              </div>
            )}

            {recipe.sourceUrl && (
              <div className="mt-2 space-y-1">
                <a 
                  href={recipe.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium no-print"
                >
                  {isYoutube ? <Youtube className="w-3.5 h-3.5 text-red-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  View Original Source
                </a>
                <p className="hidden print:block text-[10px] text-muted-foreground break-all italic mt-1">
                  Source: {recipe.sourceUrl}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border text-sm font-medium text-muted-foreground shrink-0">
            <Clock className="w-4 h-4" />
            {recipe.prepTime}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 py-6">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
              Ingredients
            </h3>
            <ul className="space-y-2">
              {recipe.ingredientsNeeded.map((ing: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground italic">
                  <span className="text-primary mt-1">•</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
              Instructions
            </h3>
            <ol className="space-y-6">
              {recipe.instructions.map((step: string, i: number) => (
                <li key={i} className="flex gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold shrink-0 text-sm">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {(isEditing || editedNotes) && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-primary" />
              Notes
            </h3>
            {isEditing ? (
              <Textarea 
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add some notes, substitutions, or tips..."
                className="min-h-[100px] bg-white no-print"
              />
            ) : (
              <div className="p-4 bg-muted/30 rounded-xl text-sm italic text-muted-foreground leading-relaxed">
                {editedNotes}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-muted/30 border-t flex flex-wrap justify-center gap-3 py-6 no-print">
        {isEditing ? (
          <>
            <Button 
              onClick={recipe.id ? handleUpdate : () => setIsEditing(false)}
              className="bg-primary hover:bg-primary/90 px-6 gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              {recipe.id ? 'Save Changes' : 'Keep Edits'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setEditedTitle(recipe.title);
                setEditedNotes(recipe.notes || '');
                setEditedChefName(recipe.chefName || '');
              }}
              className="px-6 gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </>
        ) : (
          <>
            {onSave && (
              <Button 
                onClick={handleSaveToBox}
                className="bg-accent hover:bg-accent/90 px-6 gap-2 shadow-lg transition-all"
              >
                <Heart className="w-4 h-4" />
                Save to Recipe Box
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={handlePrint}
              className="px-6 gap-2 border-primary/20 hover:border-primary/50 text-primary"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </Button>

            <Button 
              variant="outline"
              onClick={handleEmail}
              className="px-6 gap-2 border-secondary hover:border-secondary/80 text-secondary-foreground"
            >
              <Mail className="w-4 h-4" />
              Email Recipe
            </Button>

            {showRemove && onRemove && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost"
                    className="px-6 gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your saved recipe from the Recipe Box.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
