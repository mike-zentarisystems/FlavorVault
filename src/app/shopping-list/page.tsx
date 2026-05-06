"use client"

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  CalendarDays,
  Printer,
  Mail,
  Share2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ShoppingItem = {
  id: string;
  name: string;
  needed: boolean;
  category: string;
};

const INITIAL_INVENTORY: Record<string, string[]> = {
  "Personal Care & Hygiene": ["Lotion", "Razor blades", "Sunscreen", "Lip balm", "Nail polish remover", "Hair mask", "Hair oil", "Body scrub", "Shampoo", "Conditioner", "Toothpaste", "Dental floss", "Deodorant", "Perfume / cologne", "Feminine care", "Shaving cream"],
  "Cleaning & Household Supplies": ["Q-tips", "Cotton balls", "Tissues", "Clorox wipes", "Air freshener", "Incense", "Toilet paper", "Paper towels", "Garbage bags", "Quart size Ziploc bags", "Ziploc bags", "Reynolds wrap (foil)"],
  "Bath & Soap": ["Bar soap", "Hand soap", "Bubble bath"],
  "Health & Misc": ["Medicine"],
  "Pet Supplies": ["Dog food", "Wet dog food", "Dog treats", "Dog bones"],
  "Bakery & Bread": ["Sandwich bread", "Bread crumbs", "Cake", "Cupcakes", "Mini muffins"],
  "Breakfast & Cereals": ["Frosted Flakes and other cereals", "Oatmeal", "Pancake syrup", "Pop-Tarts"],
  "Dairy & Refrigerated": ["Milk", "Eggs", "String cheese", "Cheddar cubes", "American cheese", "Yogurt sticks"],
  "Meat & Protein": ["Chicken", "Hot dogs", "Pepperoni", "Bologna", "Ham"],
  "Frozen Foods": ["Frozen string beans", "Ice cream", "Ice cream sandwiches"],
  "Canned & Jarred Goods": ["Can of corn", "Canned fruit", "Spaghetti sauce", "Jelly"],
  "Pasta, Grains & Staples": ["Pasta", "Rice", "Flour", "Sugar", "Corn starch", "Baking soda", "Baking powder", "Yeast", "Salt"],
  "Condiments & Sauces": ["Ketchup", "Mustard", "BBQ sauce", "Mayo", "Marinade", "Salad dressing", "Soy sauce", "Oil", "Vinegar"],
  "Snacks & Packaged Foods": ["Protein bars", "Assorted school snacks", "Fruit strips", "Fruit gummies", "Granola bars", "Crackers", "Cookies (chocolate chip)", "Pretzels", "Pretzel sticks", "Cashew nuts", "Potato chips"],
  "Fresh Produce": ["Sweet potatoes", "Potatoes", "Onion", "Garlic", "Parsley", "Basil", "Salad", "Carrots", "Strawberries", "Oranges", "Lemons", "Apples", "Bananas", "Peaches"],
  "Fruits & Juices": ["Apple juice", "Grape juice (other juices)"],
  "Pantry Essentials": ["Peanut butter", "Dried fruit"],
  "Treats & Sweets": ["Marshmallows"],
  "Drinks": ["Coffee pods", "Zero calorie flavoring", "Zero soda", "Protein shakes"],
  "Meal Helpers": ["Shake and bake", "Taco shells", "Chili", "Pepper"]
};

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [search, setSearch] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Pantry Essentials');
  const [expandedValues, setExpandedValues] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const flattened: ShoppingItem[] = [];
    Object.entries(INITIAL_INVENTORY).forEach(([category, names]) => {
      names.forEach(name => {
        flattened.push({
          id: Math.random().toString(36).substr(2, 9),
          name,
          category,
          needed: false
        });
      });
    });
    setItems(flattened);
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const updateTimestamp = () => {
    setLastUpdated(new Date().toLocaleString());
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, needed: !item.needed } : item
    ));
    updateTimestamp();
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    updateTimestamp();
    toast({
      title: "Item Removed",
      description: "The item has been removed from your list.",
    });
  };

  const addNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName.trim(),
      category: newItemCategory,
      needed: true
    };

    setItems(prev => [newItem, ...prev]);
    setNewItemName('');
    updateTimestamp();
    toast({
      title: "Item Added",
      description: `${newItem.name} added to ${newItemCategory}.`,
    });
  };

  const neededItems = items.filter(i => i.needed);
  const categories = Array.from(new Set(items.map(i => i.category))).sort();
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExpandAll = () => setExpandedValues(categories);
  const handleCollapseAll = () => setExpandedValues([]);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    if (neededItems.length === 0) {
      toast({
        title: "List is empty",
        description: "Add some needed items before emailing.",
        variant: "destructive"
      });
      return;
    }

    const itemsByCat: Record<string, string[]> = {};
    neededItems.forEach(item => {
      if (!itemsByCat[item.category]) itemsByCat[item.category] = [];
      itemsByCat[item.category].push(item.name);
    });

    let body = "My Shopping List:\n\n";
    Object.entries(itemsByCat).forEach(([cat, names]) => {
      body += `${cat.toUpperCase()}\n`;
      names.forEach(name => body += `- [ ] ${name}\n`);
      body += "\n";
    });

    const mailto = `mailto:?subject=My%20Shopping%20List&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-full bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8 no-print">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-bold uppercase tracking-widest">
                <ShoppingCart className="w-4 h-4" />
                Inventory & Needs
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
                Shopping <span className="text-primary italic">List</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your household inventory. {neededItems.length > 0 ? `Currently need ${neededItems.length} items.` : 'Pantry is fully stocked!'}
              </p>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg w-fit">
                <CalendarDays className="w-4 h-4" />
                <span>Updated as of: <span className="font-semibold">{lastUpdated}</span></span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-xl h-11 shadow-sm">
                  <Share2 className="w-4 h-4" />
                  Export / Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem onClick={handlePrint} className="gap-2 py-2.5 cursor-pointer">
                  <Printer className="w-4 h-4" />
                  Print Needed List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEmail} className="gap-2 py-2.5 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Email Needed List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="hidden print:block space-y-8 py-8">
          <div className="border-b-2 pb-4">
            <h1 className="text-3xl font-bold">Shopping List</h1>
            <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          {neededItems.length > 0 ? (
            <div className="space-y-6">
              {categories.map(cat => {
                const catNeeded = neededItems.filter(i => i.category === cat);
                if (catNeeded.length === 0) return null;
                return (
                  <div key={cat} className="space-y-2">
                    <h2 className="text-xl font-bold border-b pb-1 uppercase text-sm tracking-wider">{cat}</h2>
                    <ul className="grid grid-cols-2 gap-2">
                      {catNeeded.map(item => (
                        <li key={item.id} className="flex items-center gap-3 py-1">
                          <div className="w-5 h-5 border-2 rounded shrink-0" />
                          <span className="text-lg">{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xl italic">No items currently needed. Pantry is fully stocked!</p>
          )}
        </div>

        <Card className="shadow-lg border-primary/10 overflow-hidden no-print">
          <CardContent className="p-6 space-y-6 bg-gradient-to-r from-primary/5 to-transparent">
            <form onSubmit={addNewItem} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Add new item (e.g. Avocado)" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="bg-white h-12 text-lg rounded-xl"
                />
              </div>
              <div className="w-full md:w-56">
                <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                  <SelectTrigger className="h-12 bg-white rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 font-bold gap-2 rounded-xl">
                <Plus className="w-5 h-5" />
                Add
              </Button>
            </form>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search inventory..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 bg-white/80 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExpandAll}
                  className="flex-1 sm:flex-none gap-2 rounded-xl"
                >
                  <ChevronDown className="w-4 h-4" />
                  Expand All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCollapseAll}
                  className="flex-1 sm:flex-none gap-2 rounded-xl"
                >
                  <ChevronUp className="w-4 h-4" />
                  Collapse All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 no-print">
          <Accordion 
            type="multiple" 
            value={expandedValues} 
            onValueChange={setExpandedValues} 
            className="space-y-4"
          >
            {categories.map(category => {
              const categoryItems = filteredItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;
              
              const categoryNeeded = categoryItems.filter(i => i.needed).length;

              return (
                <AccordionItem key={category} value={category} className="border rounded-2xl px-4 bg-white shadow-sm overflow-hidden">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        categoryNeeded > 0 ? "bg-primary animate-pulse" : "bg-muted"
                      )} />
                      <span className="text-lg font-bold font-headline">{category}</span>
                      {categoryNeeded > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                          {categoryNeeded} NEEDED
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryItems.map(item => (
                        <div 
                          key={item.id} 
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer group hover:border-primary/30",
                            item.needed ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-transparent"
                          )}
                          onClick={() => toggleItem(item.id)}
                        >
                          <Checkbox 
                            id={item.id} 
                            checked={item.needed} 
                            onCheckedChange={() => toggleItem(item.id)}
                            className="w-5 h-5 rounded-md"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Label 
                            htmlFor={item.id}
                            className={cn(
                              "flex-1 text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors",
                              item.needed ? "text-primary font-bold" : "text-foreground"
                            )}
                          >
                            {item.name}
                          </Label>
                          <div className="flex items-center gap-1">
                            {item.needed ? (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(item.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
