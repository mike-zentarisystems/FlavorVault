"use client"

import React, { useState } from 'react';
import { Plus, Trash2, Refrigerator, Loader2, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
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

interface PantrySidebarProps {
  ingredients: { id: string; name: string }[];
  onAdd: (ingredient: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  isLoading?: boolean;
}

export function PantrySidebar({ ingredients, onAdd, onRemove, onClearAll, isLoading }: PantrySidebarProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <aside className="h-full flex flex-col gap-6 p-6 bg-white/50 border-r md:sticky md:top-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Refrigerator className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-headline font-bold text-foreground">My Pantry</h2>
        </div>
        
        {ingredients.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                title="Empty Pantry"
              >
                <Eraser className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Empty your pantry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {ingredients.length} items from your digital pantry. You cannot undo this action.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Empty Pantry
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="e.g. 3 Eggs"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className="bg-white"
        />
        <Button onClick={handleAdd} size="icon" className="shrink-0 bg-primary hover:bg-primary/90">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : ingredients.length === 0 ? (
            <div className="text-center py-10 opacity-40">
              <p className="text-sm">Your pantry is empty</p>
            </div>
          ) : (
            ingredients.map((item) => (
              <Card
                key={item.id}
                className="group flex items-center justify-between p-3 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="text-sm font-medium">{item.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(item.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="pt-4 border-t text-xs text-muted-foreground flex justify-between">
        <span>Total Items:</span>
        <span className="font-bold text-primary">{ingredients.length}</span>
      </div>
    </aside>
  );
}
