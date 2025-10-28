'use client';

import { useState } from 'react';
import QuotationForm from '@/components/QuotationForm';
import QuotationList from '@/components/QuotationList';
import QuotationView from '@/components/QuotationView';
import InvoiceForm from '@/components/InvoiceForm';
import InvoiceList from '@/components/InvoiceList';
import InvoiceView from '@/components/InvoiceView';
import ItemManagement from '@/components/ItemManagement';

export default function Home() {
  const [mainSection, setMainSection] = useState<'invoices' | 'quotations' | 'items'>('invoices');
  const [activeSection, setActiveSection] = useState<'proforma' | 'tax'>('proforma');
  const [activeTab, setActiveTab] = useState<'invoices' | 'create-invoice'>('invoices');
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);
  const [quotationTab, setQuotationTab] = useState<'list' | 'form' | 'view'>('form');
  const [viewingQuotation, setViewingQuotation] = useState<string | null>(null);

  const handleViewInvoice = (invoiceId: string) => {
    setViewingInvoice(invoiceId);
  };

  const handleBackToInvoices = () => {
    setViewingInvoice(null);
  };

  if (viewingInvoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <InvoiceView invoiceId={viewingInvoice} onBack={handleBackToInvoices} />
      </div>
    );
  }

  if (viewingQuotation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <QuotationView quotationId={viewingQuotation} onBack={() => setViewingQuotation(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            World Wide Surgical Cotton <br></br> Management System
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage invoices with GST/CGST calculations and quotations
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          {/* Main Section Selector - Invoices vs Quotations */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
              <button
                onClick={() => setMainSection('invoices')}
                className={`px-6 py-3 rounded-md font-medium transition-colors text-sm ${
                  mainSection === 'invoices'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setMainSection('quotations')}
                className={`px-6 py-3 rounded-md font-medium transition-colors text-sm ${
                  mainSection === 'quotations'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                }`}
              >
                Quotations
              </button>
              <button
                onClick={() => setMainSection('items')}
                className={`px-6 py-3 rounded-md font-medium transition-colors text-sm ${
                  mainSection === 'items'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                }`}
              >
                Items
              </button>
            </div>
          </div>

          {/* Invoices Section */}
          {mainSection === 'invoices' && (
            <>
              {/* Invoice Type Selector */}
              <div className="flex justify-center mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
                  <button
                    onClick={() => setActiveSection('proforma')}
                    className={`px-6 py-2 rounded-md font-medium transition-colors text-sm ${
                      activeSection === 'proforma'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                    }`}
                  >
                    Proforma Invoice
                  </button>
                  <button
                    onClick={() => setActiveSection('tax')}
                    className={`px-6 py-2 rounded-md font-medium transition-colors text-sm ${
                      activeSection === 'tax'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                    }`}
                  >
                    Tax Invoice
                  </button>
                </div>
              </div>

              {/* Invoice Tab Selector */}
              <div className="flex justify-center mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className={`px-6 py-3 rounded-md font-medium transition-colors text-sm ${
                      activeTab === 'invoices'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                    }`}
                  >
                    {activeSection === 'proforma' ? 'Proforma Invoices' : 'Tax Invoices'}
                  </button>
                  <button
                    onClick={() => setActiveTab('create-invoice')}
                    className={`px-6 py-3 rounded-md font-medium transition-colors text-sm ${
                      activeTab === 'create-invoice'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                    }`}
                  >
                    Create {activeSection === 'proforma' ? 'Proforma Invoice' : 'Tax Invoice'}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                {activeTab === 'invoices' && (
                  <InvoiceList invoiceType={activeSection} onViewInvoice={handleViewInvoice} />
                )}
                {activeTab === 'create-invoice' && (
                  <InvoiceForm invoiceType={activeSection} />
                )}
              </div>
            </>
          )}

          {/* Quotations Section */}
          {mainSection === 'quotations' && (
            <>
              {/* Quotation Tab Selector */}
              <div className="flex justify-center mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
                  <button
                    onClick={() => setQuotationTab('form')}
                    className={`px-6 py-3 rounded-md font-medium transition-colors text-sm ${
                      quotationTab === 'form'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                    }`}
                  >
                    Create Quotation
                  </button>
                  <button
                    onClick={() => setQuotationTab('list')}
                    className={`px-6 py-3 rounded-md font-medium transition-colors text-sm ${
                      quotationTab === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                    }`}
                  >
                    Quotation List
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                {quotationTab === 'form' && <QuotationForm />}
                {quotationTab === 'list' && (
                  <QuotationList onView={(id) => { setViewingQuotation(id); setQuotationTab('view'); }} />
                )}
                {quotationTab === 'view' && viewingQuotation && (
                  <QuotationView quotationId={viewingQuotation} onBack={() => setQuotationTab('list')} />
                )}
              </div>
            </>
          )}

          {/* Items Section */}
          {mainSection === 'items' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
              <ItemManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
