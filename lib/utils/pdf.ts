import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export interface PDFOptions {
  filename?: string;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
}

export class PDFGenerator {
  static async generateFromElement(
    element: HTMLElement,
    options: PDFOptions = {}
  ): Promise<void> {
    // Prevent unused parameter warnings
    void element;
    void options;

    try {
      // This method is deprecated - use generateInvoicePDF instead
      throw new Error(
        "This method is deprecated. Please use generateInvoicePDF for professional invoice format."
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }

  static async generateInvoicePDF(
    invoiceData: {
      invoiceNumber: string;
      invoiceType?: "proforma" | "tax";
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
      transactionType: "intrastate" | "interstate";
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
      format = "a4",
      orientation = "portrait",
    } = options;

    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Helper function to add text
    const addText = (
      text: string,
      x: number,
      y: number,
      options: { fontSize?: number; fontStyle?: string; align?: string } = {}
    ) => {
      pdf.setFontSize(options.fontSize || 10);
      pdf.setFont("helvetica", options.fontStyle || "normal");
      if (options.align === "center") {
        pdf.text(text, x, y, { align: "center" });
      } else if (options.align === "right") {
        pdf.text(text, x, y, { align: "right" });
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
    addText("WORLDWIDE", margin, yPosition, {
      fontSize: 20,
      fontStyle: "bold",
    });
    addText("SURGICAL COTTON", margin, yPosition + 8, {
      fontSize: 16,
      fontStyle: "bold",
    });

    // Company contact details (right side) - Exact positioning
    const contactDetails = [
      "MFG. Unit: D-15, MIDC, Sutala, Nandura Road,",
      "Khamgaon-444303, Dist.Buldhana, Maharashtra.",
      "Tel.07263-252115, Mob.-9820441024/9920787117.",
      "Email ID: worldwide9820@gmail.com",
    ];

    let contactY = yPosition;
    contactDetails.forEach((line) => {
      addText(line, pageWidth - margin, contactY, {
        fontSize: 8,
        align: "right",
      });
      contactY += 4;
    });

    yPosition += 20;

    // Invoice title with lines - Exact spacing
    const invoiceTitle =
      invoiceData.invoiceType === "tax" ? "TAX INVOICE" : "PROFORMA INVOICE";
    addLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    addText(invoiceTitle, pageWidth / 2, yPosition, {
      fontSize: 16,
      fontStyle: "bold",
      align: "center",
    });
    yPosition += 5;
    addLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Invoice Details (Left) and Transportation Details (Right) - Exact positioning
    const leftCol = margin;
    const rightCol = pageWidth / 2 + 10;

    // Left column - Invoice Details
    addText("Invoice No. : " + invoiceData.invoiceNumber, leftCol, yPosition, {
      fontSize: 10,
    });
    addText(
      "Invoice Date : " +
        new Date(invoiceData.createdAt).toLocaleDateString("en-IN"),
      leftCol,
      yPosition + 5
    );
    addText("State : " + invoiceData.state, leftCol, yPosition + 10);

    // State Code box - Exact positioning and size
    addRect(leftCol + 50, yPosition + 7, 15, 6);
    addText("State Code", leftCol + 50, yPosition + 11, { fontSize: 6 });
    addText(invoiceData.stateCode, leftCol + 65, yPosition + 11, {
      fontSize: 8,
      align: "right",
    });

    // Right column - Transportation Details
    addText("Transportation Mode: To Pay", rightCol, yPosition, {
      fontSize: 10,
    });
    addText("Vehicle Number:----", rightCol, yPosition + 5);
    addText("Date of Supply:.", rightCol, yPosition + 10);
    addText("Place of Supply:", rightCol, yPosition + 15);

    yPosition += 25;

    // Bill To section (Left) and Order Details (Right) - Exact alignment
    addText("To,", leftCol, yPosition, { fontSize: 10 });
    addText(invoiceData.customerName, leftCol, yPosition + 5, {
      fontSize: 10,
      fontStyle: "bold",
    });

    if (invoiceData.customerAddress) {
      const addressLines = invoiceData.customerAddress.split("\n");
      let addressY = yPosition + 10;
      addressLines.forEach((line: string) => {
        addText(line, leftCol, addressY, { fontSize: 9 });
        addressY += 4;
      });
    }

    addText("GSTIN :27AAGCK1870M1Z5", leftCol, yPosition + 25, { fontSize: 9 });
    addText("State : MAHARASHTRA", leftCol, yPosition + 30);

    // State Code box for customer - Exact positioning
    addRect(leftCol + 50, yPosition + 27, 15, 6);
    addText("State Code", leftCol + 50, yPosition + 31, { fontSize: 6 });
    addText("27", leftCol + 65, yPosition + 31, {
      fontSize: 8,
      align: "right",
    });

    // Order Details (Right) - Exact positioning
    addText(
      "Order No. " + (invoiceData.orderNumber || "PO-004"),
      rightCol,
      yPosition,
      { fontSize: 10 }
    );
    addText(
      "Order Dt. " +
        (invoiceData.orderDate
          ? new Date(invoiceData.orderDate).toLocaleDateString("en-IN")
          : new Date().toLocaleDateString("en-IN")),
      rightCol,
      yPosition + 5
    );

    yPosition += 45;

    // Items Table - Exact column widths and alignment from image
    const tableStartY = yPosition;
    const colWidths = [8, 50, 12, 8, 10, 10, 10, 8, 8, 10, 15];
    const colPositions = [leftCol];
    for (let i = 1; i < colWidths.length; i++) {
      colPositions.push(colPositions[i - 1] + colWidths[i - 1]);
    }

    // Table headers - Exact alignment
    const headers = [
      "Sr. No",
      "Product Description",
      "HSN Code",
      "Unit",
      "Batch No.",
      "Mfg. Dt.",
      "Exp Dt.",
      "Qty",
      "Per",
      "Rate",
      "Taxable Amt.",
    ];

    // Helper function to get column center position
    const getColCenter = (index: number) => 
      colPositions[index] + colWidths[index] / 2;
    
    // Helper function to get column right position (with padding)
    const getColRight = (index: number, padding: number = 1) => 
      colPositions[index] + colWidths[index] - padding;

    // Draw table header with exact borders
    addRect(leftCol, yPosition, pageWidth - 2 * margin, 8);
    headers.forEach((header, index) => {
      // Determine font size based on column width
      let headerFontSize = 7;
      if (colWidths[index] < 10) {
        headerFontSize = 6;
      } else if (colWidths[index] < 15) {
        headerFontSize = 7;
      } else {
        headerFontSize = 8;
      }
      
      // Split long headers into multiple lines
      pdf.setFontSize(headerFontSize);
      pdf.setFont("helvetica", "bold");
      const textWidth = pdf.getTextWidth(header);
      const availableWidth = colWidths[index] - 2; // Leave 2mm padding
      
      if (textWidth > availableWidth) {
        // Text is too long, split it
        let lines: string[] = [];
        if (index === 1) {
          // Product Description
          lines = ["Product", "Description"];
        } else if (index === 10) {
          // Taxable Amt.
          lines = ["Taxable", "Amt."];
        } else if (header.length > 8) {
          // Generic split for long headers
          const words = header.split(" ");
          if (words.length > 1) {
            const mid = Math.ceil(words.length / 2);
            lines = [
              words.slice(0, mid).join(" "),
              words.slice(mid).join(" ")
            ];
          } else {
            // Single long word - split by character count
            const mid = Math.ceil(header.length / 2);
            lines = [header.substring(0, mid), header.substring(mid)];
          }
        } else {
          lines = [header];
        }
        
        // Draw multi-line header
        const lineHeight = 3;
        const startY = yPosition + 2;
        lines.forEach((line, lineIdx) => {
          addText(line, getColCenter(index), startY + lineIdx * lineHeight, {
            fontSize: headerFontSize,
            fontStyle: "bold",
            align: "center",
          });
        });
      } else {
        // Text fits, draw normally
        addText(header, getColCenter(index), yPosition + 4, {
          fontSize: headerFontSize,
          fontStyle: "bold",
          align: "center",
        });
      }
      
      if (index < headers.length - 1) {
        addLine(
          colPositions[index + 1],
          yPosition,
          colPositions[index + 1],
          yPosition + 8
        );
      }
    });
    yPosition += 8;

    // Table rows - Exact data alignment
    invoiceData.items.forEach((item, index) => {
      const rowY = yPosition + index * 8;
      addRect(leftCol, rowY, pageWidth - 2 * margin, 8);

      // Draw vertical lines
      colPositions.forEach((pos, i) => {
        if (i > 0) {
          addLine(pos, rowY, pos, rowY + 8);
        }
      });

      // Add data with proper alignment
      // Column 0: Sr. No (center)
      addText((index + 1).toString(), getColCenter(0), rowY + 5, {
        fontSize: 8,
        align: "center",
      });
      // Column 1: Product Description (left)
      addText(item.name, colPositions[1] + 1, rowY + 5, { fontSize: 8 });
      // Column 2: HSN Code (center)
      addText("30059040", getColCenter(2), rowY + 5, {
        fontSize: 8,
        align: "center",
      });
      // Column 3: Unit (center)
      addText("—", getColCenter(3), rowY + 5, {
        fontSize: 8,
        align: "center",
      });
      // Column 4: Batch No. (center)
      addText("—", getColCenter(4), rowY + 5, {
        fontSize: 8,
        align: "center",
      });
      // Column 5: Mfg. Dt. (center)
      addText("—", getColCenter(5), rowY + 5, {
        fontSize: 8,
        align: "center",
      });
      // Column 6: Exp Dt. (center)
      addText("—", getColCenter(6), rowY + 5, {
        fontSize: 8,
        align: "center",
      });
      // Column 7: Qty (center)
      addText(item.quantity.toString(), getColCenter(7), rowY + 5, {
        fontSize: 8,
        align: "center",
      });
      // Column 8: Per (center)
      addText("Than", getColCenter(8), rowY + 5, {
        fontSize: 8,
        align: "center",
      });
      // Column 9: Rate (center)
      addText(item.unitPrice.toFixed(2), getColCenter(9), rowY + 5, {
        fontSize: 8,
        align: "center",
      });
      // Column 10: Taxable Amt. (right)
      addText(item.total.toFixed(2), getColRight(10, 1), rowY + 5, {
        fontSize: 8,
        align: "right",
      });
    });

    yPosition += invoiceData.items.length * 8 + 10;

    // Total Invoice Amount in Words (Left) - Exact positioning
    addText("Total Invoice Amt in Words:", leftCol, yPosition, {
      fontSize: 10,
      fontStyle: "bold",
    });
    addText(
      "Ten Lakh Twenty Thousand Eight Hundred Forty Nine Only.",
      leftCol,
      yPosition + 5,
      { fontSize: 9, fontStyle: "bold" }
    );

    yPosition += 15;

    // Bank Details and Terms (Left) - Exact alignment
    addText("MFG.LIC NO.: MFG/MD/2022/000587", leftCol, yPosition, {
      fontSize: 9,
    });
    addText("GSTIN NO: 27AEJPJ9985J1ZM", leftCol, yPosition + 5, {
      fontSize: 9,
    });
    // Move bank details more to the left to avoid overlap
    const bankDetailsX = pageWidth / 2 - 10;
    addText("Bank Details:", bankDetailsX, yPosition, {
      fontSize: 9,
      fontStyle: "bold",
    });
    addText("Bank: State Bank of India.", bankDetailsX, yPosition + 5, {
      fontSize: 9,
    });
    addText("Branch: Khamgaon-ADB", bankDetailsX, yPosition + 10, { fontSize: 9 });
    addText("A/c No.: 3046206532", bankDetailsX, yPosition + 15, { fontSize: 9 });
    addText("IFS Code: SBIN0003282.", bankDetailsX, yPosition + 20, {
      fontSize: 9,
    });

    yPosition += 30;

    // Terms & Conditions - Exact positioning
    addText("Terms & Conditions:", leftCol, yPosition, {
      fontSize: 10,
      fontStyle: "bold",
    });
    addText("• Payment 100% in advance", leftCol, yPosition + 5, {
      fontSize: 9,
    });
    addText("• All Payment by A/c Payee.", leftCol, yPosition + 10, {
      fontSize: 9,
    });
    addText(
      "• No claim will be entrained after 24 hours of delivery.",
      leftCol,
      yPosition + 15,
      { fontSize: 9 }
    );

    yPosition += 25;

    // Signature section - Exact positioning
    addText("For: M/s, Worldwide Surgical Cotton.", leftCol, yPosition, {
      fontSize: 9,
    });
    addText("Proprietor.", leftCol, yPosition + 20, { fontSize: 9 });

    // Summary Section (Right side) - Exact alignment from image
    const summaryStartY = tableStartY + 20;
    const summaryX = pageWidth - margin - 50;
    const summaryWidth = 50;
    const summaryRight = summaryX + summaryWidth;
    let summaryY = summaryStartY;

    // Helper function for summary table right alignment
    const getSummaryRight = (padding: number = 1) => summaryRight - padding;

    // Summary table with exact borders and alignment
    addRect(summaryX, summaryY, summaryWidth, 8);
    addText("Total Amt", summaryX + 2, summaryY + 5, { fontSize: 8 });
    addText(invoiceData.subtotal.toFixed(2), getSummaryRight(), summaryY + 5, {
      fontSize: 8,
      align: "right",
    });
    summaryY += 8;

    addRect(summaryX, summaryY, summaryWidth, 8);
    addText(`Add: CGST ${invoiceData.cgstRate}%:`, summaryX + 2, summaryY + 5, {
      fontSize: 8,
    });
    if (invoiceData.transactionType === "intrastate") {
      addText(invoiceData.cgstAmount.toFixed(2), getSummaryRight(), summaryY + 5, {
        fontSize: 8,
        align: "right",
      });
    } else {
      addText("----", getSummaryRight(), summaryY + 5, {
        fontSize: 8,
        align: "right",
      });
    }
    summaryY += 8;

    addRect(summaryX, summaryY, summaryWidth, 8);
    addText(`Add: SGST ${invoiceData.sgstRate}%:`, summaryX + 2, summaryY + 5, {
      fontSize: 8,
    });
    if (invoiceData.transactionType === "intrastate") {
      addText(invoiceData.sgstAmount.toFixed(2), getSummaryRight(), summaryY + 5, {
        fontSize: 8,
        align: "right",
      });
    } else {
      addText("----", getSummaryRight(), summaryY + 5, {
        fontSize: 8,
        align: "right",
      });
    }
    summaryY += 8;

    addRect(summaryX, summaryY, summaryWidth, 8);
    addText(`Add: IGST ${invoiceData.igstRate}%:`, summaryX + 2, summaryY + 5, {
      fontSize: 8,
    });
    if (invoiceData.transactionType === "interstate") {
      addText(invoiceData.igstAmount.toFixed(2), getSummaryRight(), summaryY + 5, {
        fontSize: 8,
        align: "right",
      });
    } else {
      addText("----", getSummaryRight(), summaryY + 5, {
        fontSize: 8,
        align: "right",
      });
    }
    summaryY += 8;

    addRect(summaryX, summaryY, summaryWidth, 8);
    addText("Round off", summaryX + 2, summaryY + 5, { fontSize: 8 });
    addText("0.36", getSummaryRight(), summaryY + 5, {
      fontSize: 8,
      align: "right",
    });
    summaryY += 8;

    addRect(summaryX, summaryY, summaryWidth, 8);
    addText("Total Tax Amt. GST", summaryX + 2, summaryY + 5, {
      fontSize: 8,
      fontStyle: "bold",
    });
    addText(
      invoiceData.totalTaxAmount.toFixed(2),
      getSummaryRight(),
      summaryY + 5,
      { fontSize: 8, fontStyle: "bold", align: "right" }
    );
    summaryY += 8;

    addRect(summaryX, summaryY, summaryWidth, 8);
    addText("Total Amount After Tax", summaryX + 2, summaryY + 5, {
      fontSize: 8,
      fontStyle: "bold",
    });
    addText(invoiceData.totalAmount.toFixed(2), getSummaryRight(), summaryY + 5, {
      fontSize: 8,
      fontStyle: "bold",
      align: "right",
    });

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
    const {
      filename = `quotation-${quotationData.quotationNumber}.pdf`,
      format = "a4",
      orientation = "portrait",
    } = options;

    const pdf = new jsPDF({ orientation, unit: "mm", format });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 12;
    let y = margin;

    const addText = (
      text: string,
      x: number,
      y1: number,
      opts: {
        fontSize?: number;
        fontStyle?: string;
        align?: "left" | "right" | "center";
      } = {}
    ) => {
      pdf.setFontSize(opts.fontSize || 10);
      pdf.setFont("helvetica", opts.fontStyle || "normal");
      if (opts.align === "right") pdf.text(text, x, y1, { align: "right" });
      else if (opts.align === "center")
        pdf.text(text, x, y1, { align: "center" });
      else pdf.text(text, x, y1);
    };

    const line = (x1: number, y1: number, x2: number, y2: number) =>
      pdf.line(x1, y1, x2, y2);
    const rect = (x: number, y1: number, w: number, h: number) =>
      pdf.rect(x, y1, w, h);

    // Header: left company, right date
    addText("WORLDWIDE SURGICAL COTTON", margin, y, {
      fontSize: 14,
      fontStyle: "bold",
    });
    addText(
      `Date: ${new Date(
        quotationData.quotationDate || Date.now()
      ).toLocaleDateString("en-IN")}`,
      pageWidth - margin,
      y,
      { align: "right" }
    );
    y += 6;
    // Wrap long address and contact lines
    const addressMaxWidth = pageWidth - 2 * margin;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    const addressLines = pdf.splitTextToSize(
      "D-15, MIDC, Sutala, Nandura Road, Khamgaon-444303, Buldhana, Maharashtra",
      addressMaxWidth
    );
    addressLines.forEach((line: string) => {
      addText(line, margin, y, { fontSize: 8 });
      y += 4;
    });
    
    const contactLines = pdf.splitTextToSize(
      "Tel: 07263-252115 | Mob: 9820441024 / 9920787117 | Email: worldwide9820@gmail.com",
      addressMaxWidth
    );
    contactLines.forEach((line: string) => {
      addText(line, margin, y, { fontSize: 8 });
      y += 4;
    });
    y += 6;

    // Title
    line(margin, y, pageWidth - margin, y);
    y += 5;
    addText("QUOTATION", pageWidth / 2, y, {
      fontSize: 14,
      fontStyle: "bold",
      align: "center",
    });
    y += 5;
    line(margin, y, pageWidth - margin, y);
    y += 6;

    // To section
    addText("To,", margin, y);
    y += 5;
    addText(quotationData.toName, margin, y, { fontStyle: "bold" });
    if (quotationData.toDesignation) {
      y += 4;
      addText(quotationData.toDesignation, margin, y);
    }
    if (quotationData.toDepartment) {
      y += 4;
      addText(quotationData.toDepartment, margin, y);
    }
    if (quotationData.toAddress) {
      const addressMaxWidth = pageWidth - 2 * margin;
      quotationData.toAddress.split("\n").forEach((l) => {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const wrappedLines = pdf.splitTextToSize(l, addressMaxWidth);
        wrappedLines.forEach((line: string) => {
          y += 4;
          addText(line, margin, y);
        });
      });
    }
    y += 6;

    if (quotationData.subject) {
      const subjectMaxWidth = pageWidth - 2 * margin;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const subjectLines = pdf.splitTextToSize(
        "Subject: " + quotationData.subject,
        subjectMaxWidth
      );
      subjectLines.forEach((line: string, idx: number) => {
        if (idx > 0) y += 4;
        addText(line, margin, y);
      });
      y += 6;
    }
    if (quotationData.referenceLetter) {
      const refMaxWidth = pageWidth - 2 * margin;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const refLines = pdf.splitTextToSize(
        "Reference: " + quotationData.referenceLetter,
        refMaxWidth
      );
      refLines.forEach((line: string, idx: number) => {
        if (idx > 0) y += 4;
        addText(line, margin, y);
      });
      y += 6;
    }

    // Items table matching image columns
    // Adjust widths to fit within page width (pageWidth - 2*margin)
    const availableWidth = pageWidth - 2 * margin;
    const totalRequestedWidth = 12 + 80 + 22 + 36 + 30 + 20; // 200mm
    const scaleFactor = availableWidth / totalRequestedWidth;
    
    // Scale widths proportionally to fit page
    const baseWidths = [12, 80, 22, 36, 30, 20];
    const widths = baseWidths.map(w => Math.floor(w * scaleFactor));
    
    // Ensure total doesn't exceed available width
    const totalWidth = widths.reduce((sum, w) => sum + w, 0);
    const adjustment = availableWidth - totalWidth;
    if (adjustment > 0) {
      // Add remaining space to the widest column (Name of Drug)
      widths[1] += adjustment;
    }
    
    const positions = [margin];
    for (let i = 1; i < widths.length; i++)
      positions.push(positions[i - 1] + widths[i - 1]);

    // Table headers - Exact alignment
    const headers = [
      "Sr. No",
      "Name of Drug with Specification",
      "Unit Packing",
      "Rate incl. GST as per Unit Packing",
      "Mfg By",
      "MRP",
    ];

    // Helper functions for column alignment
    const getColCenter = (index: number) => 
      positions[index] + widths[index] / 2;
    const getColRight = (index: number, padding: number = 1) => 
      positions[index] + widths[index] - padding;

    const drawRow = (h: number, drawCells: (yRow: number) => void) => {
      rect(margin, y, pageWidth - 2 * margin, h);
      for (let i = 1; i < positions.length; i++)
        line(positions[i], y, positions[i], y + h);
      drawCells(y + 5);
      y += h;
    };

    // Header row
    drawRow(10, (yy) => {
      headers.forEach((h: string, i: number) => {
        // Determine font size based on column width
        let headerFontSize = 7;
        if (widths[i] < 15) {
          headerFontSize = 6;
        } else if (widths[i] < 25) {
          headerFontSize = 7;
        } else {
          headerFontSize = 8;
        }
        
        // Split long headers into multiple lines
        pdf.setFontSize(headerFontSize);
        pdf.setFont("helvetica", "bold");
        const textWidth = pdf.getTextWidth(h);
        const availableWidth = widths[i] - 2; // Leave 2mm padding
        
        let lines: string[] = [];
        if (textWidth > availableWidth || h.length > 12) {
          // Text is too long, split it
          if (i === 1) {
            // Name of Drug with Specification
            lines = ["Name of Drug", "with Specification"];
          } else if (i === 3) {
            // Rate incl. GST as per Unit Packing
            lines = ["Rate incl. GST", "as per Unit Packing"];
          } else {
            // Generic split for long headers
            const words = h.split(" ");
            if (words.length > 1) {
              const mid = Math.ceil(words.length / 2);
              lines = [
                words.slice(0, mid).join(" "),
                words.slice(mid).join(" ")
              ];
            } else {
              // Single long word - split by character count
              const mid = Math.ceil(h.length / 2);
              lines = [h.substring(0, mid), h.substring(mid)];
            }
          }
          
          // Draw multi-line header
          const lineHeight = 3;
          const startY = yy - 2;
          lines.forEach((line, lineIdx) => {
            if (i === 0) {
              // Sr. No (center)
              addText(line, getColCenter(i), startY + lineIdx * lineHeight, {
                fontSize: headerFontSize,
                fontStyle: "bold",
                align: "center",
              });
            } else if (i === 1 || i === 2 || i === 4) {
              // Left aligned
              addText(line, positions[i] + 1, startY + lineIdx * lineHeight, {
                fontSize: headerFontSize,
                fontStyle: "bold",
              });
            } else {
              // Right aligned
              addText(line, getColRight(i, 1), startY + lineIdx * lineHeight, {
                fontSize: headerFontSize,
                fontStyle: "bold",
                align: "right",
              });
            }
          });
        } else {
          // Text fits, draw normally
          if (i === 0) {
            // Sr. No (center)
            addText(h, getColCenter(i), yy, {
              fontSize: headerFontSize,
              fontStyle: "bold",
              align: "center",
            });
          } else if (i === 1 || i === 2 || i === 4) {
            // Left aligned
            addText(h, positions[i] + 1, yy, {
              fontSize: headerFontSize,
              fontStyle: "bold",
            });
          } else {
            // Right aligned
            addText(h, getColRight(i, 1), yy, {
              fontSize: headerFontSize,
              fontStyle: "bold",
              align: "right",
            });
          }
        }
      });
    });

    // Helper function to wrap text within column width
    const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", "normal");
      const splitText = pdf.splitTextToSize(text, maxWidth);
      return splitText;
    };

    // Body rows with dynamic height based on content
    quotationData.items.forEach((it, idx) => {
      // Calculate wrapped lines for each column
      const drugText = it.name + (it.description ? " - " + it.description : "");
      const drugMaxWidth = widths[1] - 2;
      const drugLines = wrapText(drugText, drugMaxWidth, 9);
      
      const unitText = it.unitPacking || "-";
      const unitMaxWidth = widths[2] - 2;
      const unitLines = wrapText(unitText, unitMaxWidth, 9);
      
      const mfgText = "M/s Worldwide Surgical Cotton (Khamgaon) Brand - Daksh";
      const mfgMaxWidth = widths[4] - 2;
      const mfgLines = wrapText(mfgText, mfgMaxWidth, 8);
      
      // Calculate max lines needed for this row
      const maxLines = Math.max(
        drugLines.length,
        unitLines.length,
        mfgLines.length,
        1 // At least 1 line
      );
      
      // Calculate row height (minimum 10mm, add 3mm per extra line)
      const rowHeight = Math.max(10, 7 + (maxLines * 3));
      
      drawRow(rowHeight, (yy) => {
        // Column 0: Sr. No (center) - vertically center if multi-line
        const srY = maxLines > 1 ? yy + ((maxLines - 1) * 3) / 2 : yy;
        addText(String(idx + 1), getColCenter(0), srY, { 
          fontSize: 9,
          align: "center"
        });
        
        // Column 1: Name of Drug (left) - with text wrapping
        drugLines.forEach((line, lineIdx) => {
          addText(
            line,
            positions[1] + 1,
            yy + (lineIdx * 3),
            { fontSize: 9 }
          );
        });
        
        // Column 2: Unit Packing (left) - with text wrapping
        unitLines.forEach((line, lineIdx) => {
          addText(line, positions[2] + 1, yy + (lineIdx * 3), { fontSize: 9 });
        });
        
        // Column 3: Rate incl. GST (right) - vertically center if multi-line
        const rateY = maxLines > 1 ? yy + ((maxLines - 1) * 3) / 2 : yy;
        addText(
          it.rateIncludingGST.toFixed(2),
          getColRight(3, 1),
          rateY,
          { fontSize: 9, align: "right" }
        );
        
        // Column 4: Mfg By (left) - with text wrapping
        mfgLines.forEach((line, lineIdx) => {
          addText(
            line,
            positions[4] + 1,
            yy + (lineIdx * 3),
            { fontSize: 8 }
          );
        });
        
        // Column 5: MRP (right) - vertically center if multi-line
        const mrpY = maxLines > 1 ? yy + ((maxLines - 1) * 3) / 2 : yy;
        addText(
          it.mrp ? it.mrp.toFixed(2) : "-",
          getColRight(5, 1),
          mrpY,
          { fontSize: 9, align: "right" }
        );
      });
    });

    // Total
    drawRow(10, (yy) => {
      addText("Total", positions[0] + 1, yy, { fontStyle: "bold" });
      addText(quotationData.subtotal.toFixed(2), getColRight(5, 1), yy, {
        align: "right",
        fontStyle: "bold",
      });
    });

    // Footer note/signature
    y += 8;
    addText("Thanking you,", pageWidth - margin - 60, y);
    y += 12;
    addText("For : Worldwide Surgical Cotton.", pageWidth - margin - 60, y);
    y += 20;
    addText("Proprietor", pageWidth - margin - 20, y);

    pdf.save(filename);
  }

  // Excel Export Functions
  static exportInvoiceToExcel(invoiceData: {
    invoiceNumber: string;
    customerName: string;
    createdAt: string;
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    totalTaxAmount: number;
    totalAmount: number;
  }) {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ["Invoice Details"],
      ["Invoice Number", invoiceData.invoiceNumber],
      ["Customer", invoiceData.customerName],
      ["Date", new Date(invoiceData.createdAt).toLocaleDateString("en-IN")],
      [],
      ["Summary"],
      ["Subtotal", invoiceData.subtotal],
      ["Tax Amount", invoiceData.totalTaxAmount],
      ["Total Amount", invoiceData.totalAmount],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    const itemsData = [["Item Name", "Quantity", "Unit Price", "Total"]];
    invoiceData.items.forEach((item) => {
      itemsData.push([
        item.name,
        String(item.quantity),
        String(item.unitPrice),
        String(item.total),
      ]);
    });
    const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
    XLSX.utils.book_append_sheet(workbook, itemsSheet, "Items");

    XLSX.writeFile(workbook, `invoice-${invoiceData.invoiceNumber}.xlsx`);
  }

  static exportQuotationToExcel(quotationData: {
    quotationNumber: string;
    toName: string;
    quotationDate?: string;
    items: Array<{
      name: string;
      description?: string;
      unitPacking?: string;
      quantity: number;
      rateIncludingGST: number;
      mrp?: number;
    }>;
    subtotal: number;
  }) {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ["Quotation Details"],
      ["Quotation Number", quotationData.quotationNumber],
      ["To", quotationData.toName],
      [
        "Date",
        quotationData.quotationDate
          ? new Date(quotationData.quotationDate).toLocaleDateString("en-IN")
          : "",
      ],
      [],
      ["Total Amount", quotationData.subtotal],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    const itemsData = [
      [
        "Item Name",
        "Description",
        "Unit Packing",
        "Quantity",
        "Rate (GST)",
        "MRP",
      ],
    ];
    quotationData.items.forEach((item) => {
      itemsData.push([
        item.name,
        item.description || "",
        item.unitPacking || "",
        String(item.quantity),
        String(item.rateIncludingGST),
        String(item.mrp || ""),
      ]);
    });
    const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
    XLSX.utils.book_append_sheet(workbook, itemsSheet, "Items");

    XLSX.writeFile(workbook, `quotation-${quotationData.quotationNumber}.xlsx`);
  }

  static exportItemsToExcel(
    items: Array<{
      name: string;
      category: string;
      unitPrice: number;
      unitPacking?: string;
      description?: string;
      isActive: boolean;
    }>
  ) {
    const workbook = XLSX.utils.book_new();
    const data = [
      [
        "Name",
        "Category",
        "Unit Price",
        "Unit Packing",
        "Description",
        "Status",
      ],
    ];
    items.forEach((item) => {
      data.push([
        item.name,
        item.category,
        String(item.unitPrice),
        item.unitPacking || "",
        item.description || "",
        item.isActive ? "Active" : "Inactive",
      ]);
    });
    const sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, "Items");
    XLSX.writeFile(workbook, "items-export.xlsx");
  }
}
