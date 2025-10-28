'use client';

import { useState, useEffect, useRef } from 'react';
import { InvoiceCalculator } from '@/lib/utils/invoice';
import { PDFGenerator } from '@/lib/utils/pdf';

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceType: 'proforma' | 'tax';
  state: string;
  stateCode: string;
  orderNumber?: string;
  orderDate?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  transactionType: 'intrastate' | 'interstate';
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  dueDate?: string;
}

interface InvoiceViewProps {
  invoiceId: string;
  onBack: () => void;
}

export default function InvoiceView({ invoiceId, onBack }: InvoiceViewProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch invoice');
        }

        setInvoice(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      setInvoice(prev => prev ? { ...prev, status: newStatus as 'draft' | 'sent' | 'paid' | 'overdue' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice || !invoiceRef.current) return;

    setPdfLoading(true);
    try {
      await PDFGenerator.generateInvoicePDF(invoice, {
        filename: `invoice-${invoice.invoiceNumber}.pdf`
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading invoice...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">
        {error}
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-300">Invoice not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div ref={invoiceRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {invoice.invoiceType === 'tax' ? 'Tax Invoice' : 'Proforma Invoice'} {invoice.invoiceNumber}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Created on {formatDate(invoice.createdAt)}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
            {invoice.dueDate && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Due: {formatDate(invoice.dueDate)}
              </p>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Bill To:
            </h3>
            <div className="text-gray-600 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-white">{invoice.customerName}</p>
              {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
              {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
              {invoice.customerAddress && (
                <p className="mt-2 whitespace-pre-line">{invoice.customerAddress}</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {invoice.invoiceType === 'tax' ? 'Tax Invoice' : 'Invoice'} Details:
            </h3>
            <div className="text-gray-600 dark:text-gray-300 space-y-1">
              <p><span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}</p>
              <p><span className="font-medium">Date:</span> {formatDate(invoice.createdAt)}</p>
              <p><span className="font-medium">Transaction Type:</span> {invoice.transactionType === 'intrastate' ? 'Intrastate (CGST + SGST)' : 'Interstate (IGST)'}</p>
              {invoice.dueDate && (
                <p><span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Items
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {InvoiceCalculator.formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {InvoiceCalculator.formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Invoice Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-700 dark:text-gray-300">Total Amt:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{InvoiceCalculator.formatCurrency(invoice.subtotal)}</span>
                </div>
                
                {invoice.transactionType === 'intrastate' ? (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-700 dark:text-gray-300">Add: CGST {invoice.cgstRate}%:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{InvoiceCalculator.formatCurrency(invoice.cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-700 dark:text-gray-300">Add: SGST {invoice.sgstRate}%:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{InvoiceCalculator.formatCurrency(invoice.sgstAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-700 dark:text-gray-300">Add: IGST {invoice.igstRate}%:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">-----</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-700 dark:text-gray-300">Add: CGST {invoice.cgstRate}%:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">-----</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-700 dark:text-gray-300">Add: SGST {invoice.sgstRate}%:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">-----</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-700 dark:text-gray-300">Add: IGST {invoice.igstRate}%:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{InvoiceCalculator.formatCurrency(invoice.igstAmount)}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-700 dark:text-gray-300">Round off:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹0.00</span>
                </div>
                
                <div className="flex justify-between items-center py-3 bg-blue-50 dark:bg-blue-900/20 rounded-md px-3">
                  <span className="text-lg font-semibold text-blue-800 dark:text-blue-200">Total Tax Amt. GST:</span>
                  <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{InvoiceCalculator.formatCurrency(invoice.totalTaxAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 rounded-md px-3">
                  <span className="text-lg font-semibold text-green-800 dark:text-green-200">Total Amount After Tax:</span>
                  <span className="text-xl font-bold text-green-700 dark:text-green-300">{InvoiceCalculator.formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back to Invoices
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {pdfLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Save as PDF
                </>
              )}
            </button>
            
            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-3 py-2 rounded-md text-sm font-medium border-0 ${getStatusColor(invoice.status)}`}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
