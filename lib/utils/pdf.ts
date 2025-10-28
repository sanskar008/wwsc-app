import jsPDF from 'jspdf';

export interface PDFOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export class PDFGenerator {
  static async generateFromElement(
    element: HTMLElement,
    options: PDFOptions = {}
  ): Promise<void> {
    const {
      filename = 'invoice.pdf',
      format = 'a4',
      orientation = 'portrait'
    } = options;

    try {
      // This method is deprecated - use generateInvoicePDF instead
      throw new Error('This method is deprecated. Please use generateInvoicePDF for professional invoice format.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  static async generateInvoicePDF(
    invoiceData: {
      invoiceNumber: string;
      invoiceType?: 'proforma' | 'tax';
      state: string;
      stateCode: string;
      orderNumber?: string;
      orderDate?: string;
      createdAt: string;
      dueDate?: string;
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      customerAddress?: string;
      items: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;
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
    },
    options: PDFOptions = {}
  ): Promise<void> {
    const {
      filename = `invoice-${invoiceData.invoiceNumber}.pdf`,
      format = 'a4',
      orientation = 'portrait'
    } = options;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Helper function to add text
    const addText = (text: string, x: number, y: number, options: { fontSize?: number; fontStyle?: string; align?: string } = {}) => {
      pdf.setFontSize(options.fontSize || 10);
      pdf.setFont('helvetica', options.fontStyle || 'normal');
      if (options.align === 'center') {
        pdf.text(text, x, y, { align: 'center' });
      } else if (options.align === 'right') {
        pdf.text(text, x, y, { align: 'right' });
      } else {
        pdf.text(text, x, y);
      }
    };

    // Helper function to add line
    const addLine = (x1: number, y1: number, x2: number, y2: number) => {
      pdf.line(x1, y1, x2, y2);
    };

    // Helper function to add rectangle
    const addRect = (x: number, y: number, w: number, h: number) => {
      pdf.rect(x, y, w, h);
    };

    // Company Header - Exact alignment from image
    addText('WORLDWIDE', margin, yPosition, { fontSize: 20, fontStyle: 'bold' });
    addText('SURGICAL COTTON', margin, yPosition + 8, { fontSize: 16, fontStyle: 'bold' });
    
    // Company contact details (right side) - Exact positioning
    const contactDetails = [
      'MFG. Unit: D-15, MIDC, Sutala, Nandura Road,',
      'Khamgaon-444303, Dist.Buldhana, Maharashtra.',
      'Tel.07263-252115, Mob.-9820441024/9920787117.',
      'Email ID: worldwide9820@gmail.com'
    ];
    
    let contactY = yPosition;
    contactDetails.forEach((line, index) => {
      addText(line, pageWidth - margin, contactY, { fontSize: 8, align: 'right' });
      contactY += 4;
    });
    
    yPosition += 20;

    // Invoice title with lines - Exact spacing
    const invoiceTitle = invoiceData.invoiceType === 'tax' ? 'TAX INVOICE' : 'PROFORMA INVOICE';
    addLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    addText(invoiceTitle, pageWidth / 2, yPosition, { fontSize: 16, fontStyle: 'bold', align: 'center' });
    yPosition += 5;
    addLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Invoice Details (Left) and Transportation Details (Right) - Exact positioning
    const leftCol = margin;
    const rightCol = pageWidth / 2 + 10;
    
    // Left column - Invoice Details
    addText('Invoice No. : ' + invoiceData.invoiceNumber, leftCol, yPosition, { fontSize: 10 });
    addText('Invoice Date : ' + new Date(invoiceData.createdAt).toLocaleDateString('en-IN'), leftCol, yPosition + 5);
    addText('State : ' + invoiceData.state, leftCol, yPosition + 10);
    
    // State Code box - Exact positioning and size
    addRect(leftCol + 50, yPosition + 7, 15, 6);
    addText('State Code', leftCol + 50, yPosition + 11, { fontSize: 6 });
    addText(invoiceData.stateCode, leftCol + 65, yPosition + 11, { fontSize: 8, align: 'right' });
    
    // Right column - Transportation Details
    addText('Transportation Mode: To Pay', rightCol, yPosition, { fontSize: 10 });
    addText('Vehicle Number:----', rightCol, yPosition + 5);
    addText('Date of Supply:.', rightCol, yPosition + 10);
    addText('Place of Supply:', rightCol, yPosition + 15);
    
    yPosition += 25;

    // Bill To section (Left) and Order Details (Right) - Exact alignment
    addText('To,', leftCol, yPosition, { fontSize: 10 });
    addText(invoiceData.customerName, leftCol, yPosition + 5, { fontSize: 10, fontStyle: 'bold' });
    
    if (invoiceData.customerAddress) {
      const addressLines = invoiceData.customerAddress.split('\n');
      let addressY = yPosition + 10;
      addressLines.forEach((line: string) => {
        addText(line, leftCol, addressY, { fontSize: 9 });
        addressY += 4;
      });
    }
    
    addText('GSTIN :27AAGCK1870M1Z5', leftCol, yPosition + 25, { fontSize: 9 });
    addText('State : MAHARASHTRA', leftCol, yPosition + 30);
    
    // State Code box for customer - Exact positioning
    addRect(leftCol + 50, yPosition + 27, 15, 6);
    addText('State Code', leftCol + 50, yPosition + 31, { fontSize: 6 });
    addText('27', leftCol + 65, yPosition + 31, { fontSize: 8, align: 'right' });
    
    // Order Details (Right) - Exact positioning
    addText('Order No. ' + (invoiceData.orderNumber || 'PO-004'), rightCol, yPosition, { fontSize: 10 });
    addText('Order Dt. ' + (invoiceData.orderDate ? new Date(invoiceData.orderDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')), rightCol, yPosition + 5);
    
    yPosition += 45;

    // Items Table - Exact column widths and alignment from image
    const tableStartY = yPosition;
    const colWidths = [8, 50, 12, 8, 10, 10, 10, 8, 8, 10, 15];
    const colPositions = [leftCol];
    for (let i = 1; i < colWidths.length; i++) {
      colPositions.push(colPositions[i-1] + colWidths[i-1]);
    }
    
    // Table headers - Exact alignment
    const headers = ['Sr. No', 'Product Description', 'HSN Code', 'Unit', 'Batch No.', 'Mfg. Dt.', 'Exp Dt.', 'Qty', 'Per', 'Rate', 'Taxable Amt.'];
    
    // Draw table header with exact borders
    addRect(leftCol, yPosition, pageWidth - 2*margin, 8);
    headers.forEach((header, index) => {
      addText(header, colPositions[index] + 1, yPosition + 5, { fontSize: 8, fontStyle: 'bold', align: 'center' });
      if (index < headers.length - 1) {
        addLine(colPositions[index + 1], yPosition, colPositions[index + 1], yPosition + 8);
      }
    });
    yPosition += 8;
    
    // Table rows - Exact data alignment
    invoiceData.items.forEach((item, index) => {
      const rowY = yPosition + (index * 8);
      addRect(leftCol, rowY, pageWidth - 2*margin, 8);
      
      // Draw vertical lines
      colPositions.forEach((pos, i) => {
        if (i > 0) {
          addLine(pos, rowY, pos, rowY + 8);
        }
      });
      
      // Add data with exact alignment
      addText((index + 1).toString(), colPositions[0] + 4, rowY + 5, { fontSize: 8, align: 'center' });
      addText(item.name, colPositions[1] + 1, rowY + 5, { fontSize: 8 });
      addText('30059040', colPositions[2] + 6, rowY + 5, { fontSize: 8, align: 'center' });
      addText('—', colPositions[3] + 4, rowY + 5, { fontSize: 8, align: 'center' });
      addText('—', colPositions[4] + 5, rowY + 5, { fontSize: 8, align: 'center' });
      addText('—', colPositions[5] + 5, rowY + 5, { fontSize: 8, align: 'center' });
      addText('—', colPositions[6] + 5, rowY + 5, { fontSize: 8, align: 'center' });
      addText(item.quantity.toString(), colPositions[7] + 4, rowY + 5, { fontSize: 8, align: 'center' });
      addText('Than', colPositions[8] + 4, rowY + 5, { fontSize: 8, align: 'center' });
      addText(item.unitPrice.toFixed(2), colPositions[9] + 5, rowY + 5, { fontSize: 8, align: 'center' });
      addText(item.total.toFixed(2), colPositions[10] + 7.5, rowY + 5, { fontSize: 8, align: 'right' });
    });
    
    yPosition += (invoiceData.items.length * 8) + 10;

    // Total Invoice Amount in Words (Left) - Exact positioning
    addText('Total Invoice Amt in Words:', leftCol, yPosition, { fontSize: 10, fontStyle: 'bold' });
    addText('Ten Lakh Twenty Thousand Eight Hundred Forty Nine Only.', leftCol, yPosition + 5, { fontSize: 9, fontStyle: 'bold' });
    
    yPosition += 15;

    // Bank Details and Terms (Left) - Exact alignment
    addText('MFG.LIC NO.: MFG/MD/2022/000587', leftCol, yPosition, { fontSize: 9 });
    addText('GSTIN NO: 27AEJPJ9985J1ZM', leftCol, yPosition + 5, { fontSize: 9 });
    addText('Bank Details:', rightCol, yPosition, { fontSize: 9, fontStyle: 'bold' });
    addText('Bank: State Bank of India.', rightCol, yPosition + 5, { fontSize: 9 });
    addText('Branch: Khamgaon-ADB', rightCol, yPosition + 10, { fontSize: 9 });
    addText('A/c No.: 3046206532', rightCol, yPosition + 15, { fontSize: 9 });
    addText('IFS Code: SBIN0003282.', rightCol, yPosition + 20, { fontSize: 9 });
    
    yPosition += 30;
    
    // Terms & Conditions - Exact positioning
    addText('Terms & Conditions:', leftCol, yPosition, { fontSize: 10, fontStyle: 'bold' });
    addText('• Payment 100% in advance', leftCol, yPosition + 5, { fontSize: 9 });
    addText('• All Payment by A/c Payee.', leftCol, yPosition + 10, { fontSize: 9 });
    addText('• No claim will be entrained after 24 hours of delivery.', leftCol, yPosition + 15, { fontSize: 9 });
    
    yPosition += 25;
    
    // Signature section - Exact positioning
    addText('For: M/s, Worldwide Surgical Cotton.', leftCol, yPosition, { fontSize: 9 });
    addText('Proprietor.', leftCol, yPosition + 20, { fontSize: 9 });

    // Summary Section (Right side) - Exact alignment from image
    const summaryStartY = tableStartY + 20;
    const summaryX = pageWidth - margin - 50;
    let summaryY = summaryStartY;
    
    // Summary table with exact borders and alignment
    addRect(summaryX, summaryY, 50, 8);
    addText('Total Amt', summaryX + 2, summaryY + 5, { fontSize: 8 });
    addText(invoiceData.subtotal.toFixed(2), summaryX + 48, summaryY + 5, { fontSize: 8, align: 'right' });
    summaryY += 8;
    
    addRect(summaryX, summaryY, 50, 8);
    addText(`Add: CGST ${invoiceData.cgstRate}%:`, summaryX + 2, summaryY + 5, { fontSize: 8 });
    if (invoiceData.transactionType === 'intrastate') {
      addText(invoiceData.cgstAmount.toFixed(2), summaryX + 48, summaryY + 5, { fontSize: 8, align: 'right' });
    } else {
      addText('----', summaryX + 48, summaryY + 5, { fontSize: 8, align: 'right' });
    }
    summaryY += 8;
    
    addRect(summaryX, summaryY, 50, 8);
    addText(`Add: SGST ${invoiceData.sgstRate}%:`, summaryX + 2, summaryY + 5, { fontSize: 8 });
    if (invoiceData.transactionType === 'intrastate') {
      addText(invoiceData.sgstAmount.toFixed(2), summaryX + 48, summaryY + 5, { fontSize: 8, align: 'right' });
    } else {
      addText('----', summaryX + 48, summaryY + 5, { fontSize: 8, align: 'right' });
    }
    summaryY += 8;
    
    addRect(summaryX, summaryY, 50, 8);
    addText(`Add: IGST ${invoiceData.igstRate}%:`, summaryX + 2, summaryY + 5, { fontSize: 8 });
    if (invoiceData.transactionType === 'interstate') {
      addText(invoiceData.igstAmount.toFixed(2), summaryX + 48, summaryY + 5, { fontSize: 8, align: 'right' });
    } else {
      addText('----', summaryX + 48, summaryY + 5, { fontSize: 8, align: 'right' });
    }
    summaryY += 8;
    
    addRect(summaryX, summaryY, 50, 8);
    addText('Round off', summaryX + 2, summaryY + 5, { fontSize: 8 });
    addText('0.36', summaryX + 48, summaryY + 5, { fontSize: 8, align: 'right' });
    summaryY += 8;
    
    addRect(summaryX, summaryY, 50, 8);
    addText('Total Tax Amt. GST', summaryX + 2, summaryY + 5, { fontSize: 8, fontStyle: 'bold' });
    addText(invoiceData.totalTaxAmount.toFixed(2), summaryX + 48, summaryY + 5, { fontSize: 8, fontStyle: 'bold', align: 'right' });
    summaryY += 8;
    
    addRect(summaryX, summaryY, 50, 8);
    addText('Total Amount After Tax', summaryX + 2, summaryY + 5, { fontSize: 8, fontStyle: 'bold' });
    addText(invoiceData.totalAmount.toFixed(2), summaryX + 48, summaryY + 5, { fontSize: 8, fontStyle: 'bold', align: 'right' });

    // Save PDF
    pdf.save(filename);
  }

  static async generateQuotationPDF(
    quotationData: {
      quotationNumber: string;
      quotationDate?: string;
      referenceLetter?: string;
      toName: string;
      toDesignation?: string;
      toDepartment?: string;
      toAddress?: string;
      subject?: string;
      items: Array<{
        name: string;
        description?: string;
        unitPacking?: string;
        quantity: number;
        rateIncludingGST: number;
        mrp?: number;
        total: number; // not displayed but kept for compatibility
      }>;
      subtotal: number;
    },
    options: PDFOptions = {}
  ): Promise<void> {
    const { filename = `quotation-${quotationData.quotationNumber}.pdf`, format = 'a4', orientation = 'portrait' } = options;

    const pdf = new jsPDF({ orientation, unit: 'mm', format });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 12;
    let y = margin;

    const addText = (text: string, x: number, y1: number, opts: { fontSize?: number; fontStyle?: string; align?: 'left' | 'right' | 'center' } = {}) => {
      pdf.setFontSize(opts.fontSize || 10);
      pdf.setFont('helvetica', opts.fontStyle || 'normal');
      if (opts.align === 'right') pdf.text(text, x, y1, { align: 'right' });
      else if (opts.align === 'center') pdf.text(text, x, y1, { align: 'center' });
      else pdf.text(text, x, y1);
    };

    const line = (x1: number, y1: number, x2: number, y2: number) => pdf.line(x1, y1, x2, y2);
    const rect = (x: number, y1: number, w: number, h: number) => pdf.rect(x, y1, w, h);

    // Header: left company, right date
    addText('WORLDWIDE SURGICAL COTTON', margin, y, { fontSize: 14, fontStyle: 'bold' });
    addText(`Date: ${new Date(quotationData.quotationDate || Date.now()).toLocaleDateString('en-IN')}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
    addText('D-15, MIDC, Sutala, Nandura Road, Khamgaon-444303, Buldhana, Maharashtra', margin, y, { fontSize: 8 });
    y += 4;
    addText('Tel: 07263-252115 | Mob: 9820441024 / 9920787117 | Email: worldwide9820@gmail.com', margin, y, { fontSize: 8 });
    y += 6;

    // Title
    line(margin, y, pageWidth - margin, y); y += 5;
    addText('QUOTATION', pageWidth / 2, y, { fontSize: 14, fontStyle: 'bold', align: 'center' });
    y += 5; line(margin, y, pageWidth - margin, y); y += 6;

    // To section
    addText('To,', margin, y);
    y += 5;
    addText(quotationData.toName, margin, y, { fontStyle: 'bold' });
    if (quotationData.toDesignation) { y += 4; addText(quotationData.toDesignation, margin, y); }
    if (quotationData.toDepartment) { y += 4; addText(quotationData.toDepartment, margin, y); }
    if (quotationData.toAddress) {
      quotationData.toAddress.split('\n').forEach((l) => { y += 4; addText(l, margin, y); });
    }
    y += 6;

    if (quotationData.subject) { addText('Subject: ' + quotationData.subject, margin, y); y += 6; }
    if (quotationData.referenceLetter) { addText('Reference: ' + quotationData.referenceLetter, margin, y); y += 6; }

    // Items table matching image columns
    const headers = ['Sr. No', 'Name of Drug with Specification', 'Unit Packing', 'Rate incl. GST as per Unit Packing', 'Mfg By', 'MRP'];
    const widths = [12, 80, 22, 36, 30, 20];
    const positions = [margin];
    for (let i = 1; i < widths.length; i++) positions.push(positions[i - 1] + widths[i - 1]);

    const drawRow = (h: number, drawCells: (yRow: number) => void) => {
      rect(margin, y, pageWidth - 2 * margin, h);
      for (let i = 1; i < positions.length; i++) line(positions[i], y, positions[i], y + h);
      drawCells(y + 5);
      y += h;
    };

    // Header row
    drawRow(10, (yy) => {
      headers.forEach((h, i) => addText(h, positions[i] + 1, yy, { fontSize: 8 }));
    });

    // Body rows
    quotationData.items.forEach((it, idx) => {
      drawRow(10, (yy) => {
        addText(String(idx + 1), positions[0] + 2, yy, { fontSize: 9 });
        addText(it.name + (it.description ? ' - ' + it.description : ''), positions[1] + 1, yy, { fontSize: 9 });
        addText(it.unitPacking || '-', positions[2] + 1, yy, { fontSize: 9 });
        addText(it.rateIncludingGST.toFixed(2), positions[3] + widths[3] - 2, yy, { fontSize: 9, align: 'right' });
        addText('M/s Worldwide Surgical Cotton (Khamgaon) Brand - Daksh', positions[4] + 1, yy, { fontSize: 8 });
        addText(it.mrp ? it.mrp.toFixed(2) : '-', positions[5] + widths[5] - 2, yy, { fontSize: 9, align: 'right' });
      });
    });

    // Total
    drawRow(10, (yy) => {
      addText('Total', positions[0] + 2, yy, { fontStyle: 'bold' });
      addText(quotationData.subtotal.toFixed(2), pageWidth - margin - 2, yy, { align: 'right', fontStyle: 'bold' });
    });

    // Footer note/signature
    y += 8;
    addText('Thanking you,', pageWidth - margin - 60, y); y += 12;
    addText('For : Worldwide Surgical Cotton.', pageWidth - margin - 60, y); y += 20;
    addText('Proprietor', pageWidth - margin - 20, y);

    pdf.save(filename);
  }
}
