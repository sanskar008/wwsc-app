'use client';

import { useEffect, useState } from 'react';

interface QuotationItemForm {
  name: string;
  description?: string;
  unitPacking?: string;
  quantity: number;
  rateIncludingGST: number;
  mrp?: number;
  selectedItemId?: string;
  isCustomItem?: boolean;
}

interface FormDataState {
  quotationNumber: string;
  quotationDate: string;
  referenceLetter: string;
  toName: string;
  toDesignation: string;
  toDepartment: string;
  toAddress: string;
  subject: string;
  items: QuotationItemForm[];
  notes: string;
}

export default function QuotationForm() {
  interface DbItem {
    _id: string;
    name: string;
    description?: string;
    category: string;
    unitPrice: number;
    unitPacking?: string;
  }
  const [dbItems, setDbItems] = useState<DbItem[]>([]);
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      setItemError(null);
      try {
        const res = await fetch('/api/items?activeOnly=true');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load items');
        setDbItems(data.data || []);
      } catch (e) {
        setItemError(e instanceof Error ? e.message : 'Failed to load items');
      }
    };
    loadItems();
  }, []);

  const CATEGORIES = Array.from(new Set(dbItems.map(i => i.category))).sort();
  const getByCategory = (cat: string) => dbItems.filter(i => i.category === cat);
  const [formData, setFormData] = useState<FormDataState>({
    quotationNumber: '',
    quotationDate: '',
    referenceLetter: '',
    toName: '',
    toDesignation: '',
    toDepartment: '',
    toAddress: '',
    subject: 'Quotation for the supply of medicines/items (open quotation)',
    items: [
      { name: '', description: '', unitPacking: '', quantity: 1, rateIncludingGST: 0, mrp: undefined, selectedItemId: '', isCustomItem: false }
    ],
    notes: 'Thanking you,\n\nFor : Worldwide Surgical Cotton.\n\nProprietor'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: keyof FormDataState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof QuotationItemForm, value: string | number) => {
    const next = [...formData.items];
    next[index] = { ...next[index], [field]: value } as QuotationItemForm;
    setFormData((prev) => ({ ...prev, items: next }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', unitPacking: '', quantity: 1, rateIncludingGST: 0, mrp: undefined, selectedItemId: '', isCustomItem: false }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    const next = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: next }));
  };

  const handleCustomToggle = (index: number) => {
    const next = [...formData.items];
    next[index] = { name: '', description: '', unitPacking: '', quantity: 1, rateIncludingGST: 0, mrp: undefined, selectedItemId: '', isCustomItem: !next[index].isCustomItem };
    setFormData((prev) => ({ ...prev, items: next }));
  };

  const handleItemSelection = (index: number, selectedItemId: string) => {
    const selected = dbItems.find((i) => i._id === selectedItemId);
    if (!selected) return;
    const next = [...formData.items];
    next[index] = {
      ...next[index],
      name: selected.name,
      description: selected.description,
      rateIncludingGST: selected.unitPrice,
      unitPacking: selected.unitPacking || next[index].unitPacking,
      selectedItemId,
      isCustomItem: false
    };
    setFormData((prev) => ({ ...prev, items: next }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationNumber: formData.quotationNumber || undefined,
          quotationDate: formData.quotationDate || undefined,
          referenceLetter: formData.referenceLetter || undefined,
          toName: formData.toName,
          toDesignation: formData.toDesignation || undefined,
          toDepartment: formData.toDepartment || undefined,
          toAddress: formData.toAddress || undefined,
          subject: formData.subject || undefined,
          items: formData.items.filter((i) => i.name.trim() !== '').map((i) => ({
            name: i.name,
            description: i.description || undefined,
            unitPacking: i.unitPacking || undefined,
            quantity: i.quantity,
            rateIncludingGST: i.rateIncludingGST,
            mrp: i.mrp || undefined
          })),
          notes: formData.notes || undefined
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to create quotation');
      setSuccess(`Quotation ${data.data.quotationNumber} created successfully!`);

      setFormData({
        quotationNumber: '', quotationDate: '', referenceLetter: '', toName: '', toDesignation: '', toDepartment: '', toAddress: '', subject: 'Quotation for the supply of medicines/items (open quotation)',
        items: [{ name: '', description: '', unitPacking: '', quantity: 1, rateIncludingGST: 0, mrp: undefined, selectedItemId: '', isCustomItem: false }],
        notes: 'Thanking you,\n\nFor : Worldwide Surgical Cotton.\n\nProprietor'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = formData.items.reduce((sum, i) => sum + (i.quantity || 1) * (i.rateIncludingGST || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Quotation</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quotation Number</label>
              <input type="text" value={formData.quotationNumber} onChange={(e) => handleChange('quotationNumber', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Auto-generated if empty" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
              <input type="date" value={formData.quotationDate} onChange={(e) => handleChange('quotationDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reference Letter</label>
              <input type="text" value={formData.referenceLetter} onChange={(e) => handleChange('referenceLetter', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Reference details" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To (Name) *</label>
              <input type="text" required value={formData.toName} onChange={(e) => handleChange('toName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Designation</label>
              <input type="text" value={formData.toDesignation} onChange={(e) => handleChange('toDesignation', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
              <input type="text" value={formData.toDepartment} onChange={(e) => handleChange('toDepartment', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
              <textarea value={formData.toAddress} onChange={(e) => handleChange('toAddress', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
            <input type="text" value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Items</h3>
              <button type="button" onClick={addItem} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Add Item</button>
            </div>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-8 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item *</label>
                      <button type="button" onClick={() => handleCustomToggle(index)} className={`text-xs px-2 py-1 rounded ${item.isCustomItem ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>{item.isCustomItem ? 'Custom' : 'Predefined'}</button>
                    </div>
                    {item.isCustomItem ? (
                      <input type="text" required value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Enter item name" />
                    ) : (
                      <select value={item.selectedItemId || ''} onChange={(e) => handleItemSelection(index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" required>
                        <option value="">Select an item...</option>
                    {CATEGORIES.map((category) => (
                          <optgroup key={category} label={category}>
                            {getByCategory(category).map((pre) => (
                              <option key={pre._id} value={pre._id}>{pre.name}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Packing</label>
                    <input type="text" value={item.unitPacking || ''} onChange={(e) => handleItemChange(index, 'unitPacking', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder="e.g., 1 Roll" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qty *</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value || '0', 10) || 1)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate inc. GST *</label>
                    <input type="number" min="0" step="0.01" value={item.rateIncludingGST} onChange={(e) => handleItemChange(index, 'rateIncludingGST', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MRP</label>
                    <input type="number" min="0" step="0.01" value={item.mrp || 0} onChange={(e) => handleItemChange(index, 'mrp', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input type="text" value={item.description || ''} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="flex items-end">
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Total Amount:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
            </div>
          </div>

          {error && <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">{error}</div>}
          {success && <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md">{success}</div>}
          {itemError && <div className="p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 rounded-md">{itemError}</div>}

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{loading ? 'Creating Quotation...' : 'Create Quotation'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


