'use client';

import { useEffect, useState } from 'react';
import { InvoiceCalculator } from '@/lib/utils/invoice';

interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  selectedItemId?: string;
  isCustomItem?: boolean;
}

interface InvoiceFormData {
  invoiceNumber: string;
  state: string;
  stateCode: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  transactionType: 'intrastate' | 'interstate';
  dueDate: string;
}

interface InvoiceFormProps {
  invoiceType?: 'proforma' | 'tax';
}

export default function InvoiceForm({ invoiceType = 'proforma' }: InvoiceFormProps) {
  // DB-backed items
  interface DbItem {
    _id: string;
    name: string;
    description?: string;
    category: string;
    unitPrice: number;
    unitPacking?: string;
  }
  const [dbItems, setDbItems] = useState<DbItem[]>([]);
  const [itemLoading, setItemLoading] = useState<boolean>(true);
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      setItemLoading(true);
      setItemError(null);
      try {
        const res = await fetch('/api/items?activeOnly=true');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load items');
        setDbItems(data.data || []);
      } catch (e) {
        setItemError(e instanceof Error ? e.message : 'Failed to load items');
      } finally {
        setItemLoading(false);
      }
    };
    loadItems();
  }, []);

  const itemCategories = Array.from(new Set(dbItems.map(i => i.category))).sort();
  const getItemsByCategoryLocal = (category: string) => dbItems.filter(i => i.category === category);

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: '',
    state: 'Maharashtra',
    stateCode: '27',
    orderNumber: '',
    orderDate: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [{ name: '', description: '', quantity: 1, unitPrice: 0, selectedItemId: '', isCustomItem: false }],
    cgstRate: 6,
    sgstRate: 6,
    igstRate: 12,
    transactionType: 'intrastate',
    dueDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof InvoiceFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', quantity: 1, unitPrice: 0, selectedItemId: '', isCustomItem: false }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleItemSelection = (index: number, selectedItemId: string) => {
    const selectedItem = dbItems.find(item => item._id === selectedItemId);
    if (selectedItem) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        name: selectedItem.name,
        description: selectedItem.description || '',
        unitPrice: selectedItem.unitPrice,
        selectedItemId: selectedItem._id,
        isCustomItem: false
      };
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleCustomItemToggle = (index: number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      isCustomItem: !newItems[index].isCustomItem,
      selectedItemId: '',
      name: '',
      description: '',
      unitPrice: 0
    };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotals = () => {
    const itemsWithTotals = formData.items.map(item => ({
      ...item,
      total: InvoiceCalculator.calculateItemTotal(item.quantity, item.unitPrice)
    }));

    const subtotal = InvoiceCalculator.calculateSubtotal(itemsWithTotals);
    
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    
    if (formData.transactionType === 'intrastate') {
      cgstAmount = (subtotal * formData.cgstRate) / 100;
      sgstAmount = (subtotal * formData.sgstRate) / 100;
    } else {
      igstAmount = (subtotal * formData.igstRate) / 100;
    }
    
    const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;
    const totalAmountAfterTax = subtotal + totalTaxAmount;

    return { 
      subtotal, 
      cgstAmount, 
      sgstAmount, 
      igstAmount, 
      totalTaxAmount, 
      totalAmountAfterTax 
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceNumber: formData.invoiceNumber || undefined,
          invoiceType: invoiceType,
          state: formData.state,
          stateCode: formData.stateCode,
          orderNumber: formData.orderNumber || undefined,
          orderDate: formData.orderDate || undefined,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail || undefined,
          customerPhone: formData.customerPhone || undefined,
          customerAddress: formData.customerAddress || undefined,
          items: formData.items.filter(item => item.name.trim() !== ''),
          cgstRate: formData.cgstRate,
          sgstRate: formData.sgstRate,
          igstRate: formData.igstRate,
          transactionType: formData.transactionType,
          dueDate: formData.dueDate || undefined
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create invoice');
      }

      setSuccess(`${invoiceType === 'tax' ? 'Tax Invoice' : 'Proforma Invoice'} ${data.data.invoiceNumber} created successfully!`);
      
      // Reset form
      setFormData({
        invoiceNumber: '',
        state: 'Maharashtra',
        stateCode: '27',
        orderNumber: '',
        orderDate: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        items: [{ name: '', description: '', quantity: 1, unitPrice: 0, selectedItemId: '', isCustomItem: false }],
        cgstRate: 6,
        sgstRate: 6,
        igstRate: 12,
        transactionType: 'intrastate',
        dueDate: ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, cgstAmount, sgstAmount, igstAmount, totalTaxAmount, totalAmountAfterTax } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create New {invoiceType === 'tax' ? 'Tax' : 'Proforma'} Invoice
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
              {invoiceType === 'tax' ? 'Tax Invoice' : 'Proforma Invoice'} Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State Code
                </label>
                <input
                  type="text"
                  value={formData.stateCode}
                  onChange={(e) => handleInputChange('stateCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter state code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter order number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Date
                </label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => handleInputChange('orderDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer Email
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer Phone
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Customer Address
            </label>
            <textarea
              value={formData.customerAddress}
              onChange={(e) => handleInputChange('customerAddress', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter customer address"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Type
            </label>
            <select
              value={formData.transactionType}
              onChange={(e) => handleInputChange('transactionType', e.target.value as 'intrastate' | 'interstate')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="intrastate">Intrastate (CGST + SGST)</option>
              <option value="interstate">Interstate (IGST)</option>
            </select>
          </div>

          {/* Tax Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CGST Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.cgstRate}
                onChange={(e) => handleInputChange('cgstRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SGST Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.sgstRate}
                onChange={(e) => handleInputChange('sgstRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IGST Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.igstRate}
                onChange={(e) => handleInputChange('igstRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Items
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Item Name *
                      </label>
                      <button
                        type="button"
                        onClick={() => handleCustomItemToggle(index)}
                        className={`text-xs px-2 py-1 rounded ${
                          item.isCustomItem 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}
                      >
                        {item.isCustomItem ? 'Custom' : 'Predefined'}
                      </button>
                    </div>
                    
                    {item.isCustomItem ? (
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter custom item name"
                      />
                    ) : (
                      <select
                        value={item.selectedItemId || ''}
                        onChange={(e) => handleItemSelection(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select an item...</option>
                        {itemCategories.map(category => (
                          <optgroup key={category} label={category}>
                            {getItemsByCategoryLocal(category).map(predefinedItem => (
                              <option key={predefinedItem._id} value={predefinedItem._id}>
                                {predefinedItem.name} - ₹{predefinedItem.unitPrice}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
                    
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-md text-gray-900 dark:text-white font-medium">
                      {InvoiceCalculator.formatCurrency(InvoiceCalculator.calculateItemTotal(item.quantity, item.unitPrice))}
                    </div>
                  </div>

                  <div className="flex items-end">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {invoiceType === 'tax' ? 'Tax Invoice' : 'Proforma Invoice'} Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300">Total Amt:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{InvoiceCalculator.formatCurrency(subtotal)}</span>
              </div>
              
              {formData.transactionType === 'intrastate' ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-700 dark:text-gray-300">Add: CGST {formData.cgstRate}%:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{InvoiceCalculator.formatCurrency(cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-700 dark:text-gray-300">Add: SGST {formData.sgstRate}%:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{InvoiceCalculator.formatCurrency(sgstAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-700 dark:text-gray-300">Add: IGST {formData.igstRate}%:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">-----</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-700 dark:text-gray-300">Add: CGST {formData.cgstRate}%:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">-----</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-700 dark:text-gray-300">Add: SGST {formData.sgstRate}%:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">-----</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-700 dark:text-gray-300">Add: IGST {formData.igstRate}%:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{InvoiceCalculator.formatCurrency(igstAmount)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300">Round off:</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹0.00</span>
              </div>
              
              <div className="flex justify-between items-center py-3 bg-blue-50 dark:bg-blue-900/20 rounded-md px-3">
                <span className="text-lg font-semibold text-blue-800 dark:text-blue-200">Total Tax Amt. GST:</span>
                <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{InvoiceCalculator.formatCurrency(totalTaxAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 rounded-md px-3">
                <span className="text-lg font-semibold text-green-800 dark:text-green-200">Total Amount After Tax:</span>
                <span className="text-xl font-bold text-green-700 dark:text-green-300">{InvoiceCalculator.formatCurrency(totalAmountAfterTax)}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          {itemError && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 rounded-md">
              {itemError}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? `Creating ${invoiceType === 'tax' ? 'Tax ' : 'Proforma '}Invoice...` : `Create ${invoiceType === 'tax' ? 'Tax ' : 'Proforma '}Invoice`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
