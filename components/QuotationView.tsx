'use client';

import { useEffect, useRef, useState } from 'react';
import { PDFGenerator } from '@/lib/utils/pdf';

interface QuotationItem {
  name: string;
  description?: string;
  unitPacking?: string;
  quantity: number;
  rateIncludingGST: number;
  mrp?: number;
  total: number;
}

interface Quotation {
  _id: string;
  quotationNumber: string;
  quotationDate: string;
  referenceLetter?: string;
  toName: string;
  toDesignation?: string;
  toDepartment?: string;
  toAddress?: string;
  subject?: string;
  items: QuotationItem[];
  subtotal: number;
  notes?: string;
  createdAt: string;
}

interface Props {
  quotationId: string;
  onBack: () => void;
}

export default function QuotationView({ quotationId, onBack }: Props) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/quotations/${quotationId}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch quotation');
        setQuotation(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    if (quotationId) fetchQuotation();
  }, [quotationId]);

  const handleDownloadPDF = async () => {
    if (!quotation) return;
    setPdfLoading(true);
    try {
      await PDFGenerator.generateQuotationPDF(quotation, { filename: `quotation-${quotation.quotationNumber}.pdf` } as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading quotation...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">{error}</div>;
  }

  if (!quotation) {
    return <div className="text-center py-8"><p className="text-gray-600 dark:text-gray-300">Quotation not found.</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6" ref={containerRef}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quotation {quotation.quotationNumber}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Date: {formatDate(quotation.quotationDate || quotation.createdAt)}</p>
          </div>
          <div className="text-right">
            {quotation.referenceLetter && <p className="text-sm text-gray-600 dark:text-gray-300">Ref: {quotation.referenceLetter}</p>}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-800 dark:text-gray-100 font-semibold">To,</p>
          <p className="text-gray-700 dark:text-gray-300">{quotation.toName}</p>
          {quotation.toDesignation && <p className="text-gray-700 dark:text-gray-300">{quotation.toDesignation}</p>}
          {quotation.toDepartment && <p className="text-gray-700 dark:text-gray-300">{quotation.toDepartment}</p>}
          {quotation.toAddress && <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{quotation.toAddress}</p>}
        </div>

        {quotation.subject && (
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Subject</span>: {quotation.subject}</p>
          </div>
        )}

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sr.</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name of Drug with Specification</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Packing</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rate including GST as per Unit Packing</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mfg By</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">MRP</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {quotation.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    <div className="font-medium">{it.name}</div>
                    {it.description && <div className="text-gray-500 dark:text-gray-400 text-xs">{it.description}</div>}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{it.unitPacking || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">₹{it.rateIncludingGST.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">M/s Worldwide Surgical Cotton (Khamgaon) Brand - Daksh</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{it.mrp ? `₹${it.mrp.toFixed(2)}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-6">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Total: ₹{quotation.subtotal.toFixed(2)}</div>
          </div>
        </div>

        {quotation.notes && (
          <div className="mt-8 text-gray-700 dark:text-gray-300 whitespace-pre-line">{quotation.notes}</div>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-top">
          <button onClick={onBack} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">← Back to Quotations</button>
          <button onClick={handleDownloadPDF} disabled={pdfLoading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">{pdfLoading ? 'Generating...' : 'Save as PDF'}</button>
        </div>
      </div>
    </div>
  );
}


