import React, { useMemo, useState } from 'react';
import {
  ShoppingCart, ShoppingBasket, Store, Shirt, Footprints, Tv, Smartphone, Wrench, PaintBucket, Gem, BookOpen, Armchair,
  Glasses, Truck, Warehouse, Boxes, Factory, Printer, Scissors, Laptop, Briefcase, UserRound, Megaphone, GraduationCap,
  Camera, HeartPulse, Building2, Microscope, Pill, Package, Utensils, Coffee, Cake, Hotel, Car, Settings, Cog, Send,
  HardHat, Hammer, Building, Check, ChevronsUpDown,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { industryCategories } from '../lib/industryConfig';
import { cn } from '../lib/utils';

const ICONS = {
  ShoppingCart, ShoppingBasket, Store, Shirt, Footprints, Tv, Smartphone, Wrench, PaintBucket, Gem, BookOpen, Armchair,
  Glasses, Truck, Warehouse, Boxes, Factory, Printer, Scissors, Laptop, Briefcase, UserRound, Megaphone, GraduationCap,
  Camera, HeartPulse, Building2, Microscope, Pill, Package, Utensils, Coffee, Cake, Hotel, Car, Settings, Cog, Send,
  HardHat, Hammer, Building,
};

/** Searchable, grouped business type picker. The choice sets the starting invoice template. */
export const IndustryPicker = ({ value, onChange, id = 'industry', invalid = false }) => {
  const [open, setOpen] = useState(false);
  const categories = useMemo(() => industryCategories(), []);
  const selected = categories.flatMap((c) => c.items).find((i) => i.value === value);
  const SelectedIcon = selected ? ICONS[selected.icon] || Briefcase : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button id={id} type="button" role="combobox" aria-expanded={open} aria-invalid={invalid || undefined}
          className={cn('flex h-11 w-full items-center gap-2 rounded-md border bg-background px-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring', invalid ? 'border-red-400' : 'border-input')}>
          {SelectedIcon && <SelectedIcon className="h-4 w-4 text-indigo-600" />}
          <span className={cn('flex-1 truncate', !selected && 'text-muted-foreground')}>{selected ? selected.label : 'Select your business type'}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search: pharmacy, restaurant, garage…" />
          <CommandList className="max-h-72">
            <CommandEmpty>No match. Choose “Other”.</CommandEmpty>
            {categories.map(({ category, items }) => (
              <CommandGroup key={category} heading={category}>
                {items.map((item) => {
                  const Icon = ICONS[item.icon] || Briefcase;
                  return (
                    <CommandItem key={item.value} value={`${item.label} ${category}`} onSelect={() => { onChange(item.value); setOpen(false); }}>
                      <Icon className="mr-2 h-4 w-4 text-slate-500" />
                      <span className="flex-1">{item.label}</span>
                      <Check className={cn('h-4 w-4', item.value === value ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default IndustryPicker;
