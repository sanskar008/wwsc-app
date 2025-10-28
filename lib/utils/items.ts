export interface PredefinedItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  defaultUnitPrice: number;
}

export const PREDEFINED_ITEMS: PredefinedItem[] = [
  // Surgical Cotton Products
  {
    id: 'surgical-cotton-rolls',
    name: 'Surgical Cotton Rolls',
    description: 'Sterile cotton rolls for medical use',
    category: 'Surgical Cotton',
    defaultUnitPrice: 25.00
  },
  {
    id: 'surgical-cotton-balls',
    name: 'Surgical Cotton Balls',
    description: 'Sterile cotton balls for wound care',
    category: 'Surgical Cotton',
    defaultUnitPrice: 15.00
  },
  {
    id: 'surgical-cotton-pads',
    name: 'Surgical Cotton Pads',
    description: 'Sterile cotton pads for medical procedures',
    category: 'Surgical Cotton',
    defaultUnitPrice: 20.00
  },
  {
    id: 'surgical-cotton-gauze',
    name: 'Surgical Cotton Gauze',
    description: 'Sterile cotton gauze for dressing',
    category: 'Surgical Cotton',
    defaultUnitPrice: 30.00
  },
  {
    id: 'surgical-cotton-swabs',
    name: 'Surgical Cotton Swabs',
    description: 'Sterile cotton swabs for medical use',
    category: 'Surgical Cotton',
    defaultUnitPrice: 12.00
  },

  // Medical Supplies
  {
    id: 'medical-gloves',
    name: 'Medical Gloves',
    description: 'Disposable medical examination gloves',
    category: 'Medical Supplies',
    defaultUnitPrice: 45.00
  },
  {
    id: 'surgical-masks',
    name: 'Surgical Masks',
    description: 'Disposable surgical face masks',
    category: 'Medical Supplies',
    defaultUnitPrice: 35.00
  },
  {
    id: 'bandages',
    name: 'Medical Bandages',
    description: 'Elastic medical bandages',
    category: 'Medical Supplies',
    defaultUnitPrice: 40.00
  },
  {
    id: 'adhesive-tape',
    name: 'Medical Adhesive Tape',
    description: 'Hypoallergenic medical tape',
    category: 'Medical Supplies',
    defaultUnitPrice: 28.00
  },
  {
    id: 'antiseptic-solution',
    name: 'Antiseptic Solution',
    description: 'Povidone-iodine antiseptic solution',
    category: 'Medical Supplies',
    defaultUnitPrice: 65.00
  },

  // Cotton Products
  {
    id: 'cotton-yarn',
    name: 'Cotton Yarn',
    description: 'High quality cotton yarn for textile industry',
    category: 'Cotton Products',
    defaultUnitPrice: 85.00
  },
  {
    id: 'cotton-fabric',
    name: 'Cotton Fabric',
    description: 'Pure cotton fabric rolls',
    category: 'Cotton Products',
    defaultUnitPrice: 120.00
  },
  {
    id: 'cotton-thread',
    name: 'Cotton Thread',
    description: 'Strong cotton thread for sewing',
    category: 'Cotton Products',
    defaultUnitPrice: 18.00
  },
  {
    id: 'cotton-wadding',
    name: 'Cotton Wadding',
    description: 'Soft cotton wadding for padding',
    category: 'Cotton Products',
    defaultUnitPrice: 55.00
  },
  {
    id: 'cotton-lint',
    name: 'Cotton Lint',
    description: 'Fine cotton lint for medical use',
    category: 'Cotton Products',
    defaultUnitPrice: 22.00
  },

  // Industrial Cotton
  {
    id: 'industrial-cotton',
    name: 'Industrial Cotton',
    description: 'Heavy duty cotton for industrial applications',
    category: 'Industrial Cotton',
    defaultUnitPrice: 75.00
  },
  {
    id: 'cotton-filters',
    name: 'Cotton Filters',
    description: 'Cotton filter pads for filtration systems',
    category: 'Industrial Cotton',
    defaultUnitPrice: 95.00
  },
  {
    id: 'cotton-insulation',
    name: 'Cotton Insulation',
    description: 'Cotton insulation material',
    category: 'Industrial Cotton',
    defaultUnitPrice: 110.00
  },
  {
    id: 'cotton-packing',
    name: 'Cotton Packing Material',
    description: 'Cotton packing for fragile items',
    category: 'Industrial Cotton',
    defaultUnitPrice: 35.00
  },
  {
    id: 'cotton-absorbent',
    name: 'Cotton Absorbent Pads',
    description: 'Highly absorbent cotton pads',
    category: 'Industrial Cotton',
    defaultUnitPrice: 42.00
  }
];

export const ITEM_CATEGORIES = [
  'Surgical Cotton',
  'Medical Supplies', 
  'Cotton Products',
  'Industrial Cotton'
];

export function getItemsByCategory(category: string): PredefinedItem[] {
  return PREDEFINED_ITEMS.filter(item => item.category === category);
}

export function getItemById(id: string): PredefinedItem | undefined {
  return PREDEFINED_ITEMS.find(item => item.id === id);
}

export function searchItems(query: string): PredefinedItem[] {
  const lowercaseQuery = query.toLowerCase();
  return PREDEFINED_ITEMS.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.description?.toLowerCase().includes(lowercaseQuery) ||
    item.category.toLowerCase().includes(lowercaseQuery)
  );
}
