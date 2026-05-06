"use client"

import React, { useState } from 'react';
import { Import, FileText, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { importRecipe, ImportRecipeOutput } from '@/ai/flows/import-recipe-flow';

interface ImportRecipeDialogProps {
  onImportSuccess: (recipe: ImportRecipeOutput) => void;
}

export function ImportRecipeDialog({ onImportSuccess }: ImportRecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const { toast } = useToast();

  const handleTextImport = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    try {
      const result = await importRecipe({ type: 'text', content: textInput });
      onImportSuccess(result);
      setOpen(false);
      setTextInput('');
    } catch (error) {
      toast({ title: "Import Failed", description: "Chef Mikeo couldn't read that text.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    try {
      const result = await importRecipe({ type: 'url', content: urlInput });
      onImportSuccess(result);
      setOpen(false);
      setUrlInput('');
    } catch (error) {
      toast({ title: "Import Failed", description: "Chef Mikeo couldn't reach that URL.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const result = await importRecipe({ 
          type: file.type.includes('image') ? 'image' : 'document', 
          content: base64 
        });
        onImportSuccess(result);
        setOpen(false);
      } catch (error) {
        toast({ title: "Import Failed", description: "Chef Mikeo couldn't see the recipe in that file.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Import className="w-4 h-4" />
          Import Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Import className="w-5 h-5 text-primary" />
            Import a Recipe
          </DialogTitle>
          <DialogDescription>
            Have a recipe elsewhere? Let Chef Mikeo organize it for you.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="gap-2">
              <FileText className="w-4 h-4" /> Text
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <LinkIcon className="w-4 h-4" /> URL
            </TabsTrigger>
            <TabsTrigger value="file" className="gap-2">
              <ImageIcon className="w-4 h-4" /> File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 pt-4">
            <Textarea 
              placeholder="Paste a recipe text here..." 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[200px]"
            />
            <Button className="w-full" onClick={handleTextImport} disabled={loading || !textInput}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Import Text"}
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-4 pt-4">
            <Input 
              placeholder="https://cool-recipes.com/pasta" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <Button className="w-full" onClick={handleUrlImport} disabled={loading || !urlInput}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Import from URL"}
            </Button>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 pt-4 text-center">
            <div className="border-2 border-dashed rounded-xl p-8 hover:bg-muted/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={loading}
              />
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Click to upload image or PDF</p>
              <p className="text-xs text-muted-foreground mt-1">Photo of a cookbook or digital file</p>
            </div>
            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-primary animate-pulse">
                <Loader2 className="animate-spin w-4 h-4" />
                Processing...
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
