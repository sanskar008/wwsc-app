# WWSC Invoice System Setup

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/wwsc-app

# For production, use a connection string like:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wwsc-app

# JWT Secret (for future authentication features)
JWT_SECRET=your-super-secret-jwt-key-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Set up MongoDB:
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud) and update the MONGODB_URI

3. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Invoice Management

#### POST /api/invoices
Create a new invoice with GST/CGST calculations.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+91 9876543210",
  "customerAddress": "123 Main St, City, State",
  "items": [
    {
      "name": "Product A",
      "description": "Description of product",
      "quantity": 2,
      "unitPrice": 100.00
    }
  ],
  "gstRate": 9,
  "cgstRate": 9,
  "dueDate": "2024-12-31",
  "userId": "optional-user-id"
}
```

#### GET /api/invoices
Retrieve invoices with filtering and pagination.

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `status` (optional) - Filter by status (draft, sent, paid, overdue)
- `search` (optional) - Search by customer name, email, or invoice number
- `limit` (optional) - Number of results (default: 10)
- `page` (optional) - Page number (default: 1)

#### GET /api/invoices/[id]
Get a specific invoice by ID.

#### PUT /api/invoices/[id]
Update invoice status or other fields.

#### DELETE /api/invoices/[id]
Delete an invoice.

#### GET /api/invoices/statistics
Get invoice statistics and analytics.

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `days` (optional) - Number of days to analyze (default: 30)

### Calculator API (Legacy)

#### POST /api/calculate
Perform mathematical calculations and store results in database.

**Request Body:**
```json
{
  "operation": "add",
  "operands": [1, 2, 3],
  "userId": "optional-user-id"
}
```

**Supported Operations:**
- `add` - Addition
- `subtract` - Subtraction  
- `multiply` - Multiplication
- `divide` - Division
- `power` - Exponentiation
- `sqrt` - Square root
- `factorial` - Factorial

#### GET /api/calculate
Retrieve calculation history with pagination.

#### GET /api/statistics
Get usage statistics and analytics.

#### GET /api/health
Health check endpoint for monitoring.

## Features

### Invoice Management
- ✅ **Create invoices** with multiple items
- ✅ **GST/CGST tax calculations** with customizable rates
- ✅ **Customer management** with contact information
- ✅ **Invoice status tracking** (draft, sent, paid, overdue)
- ✅ **Invoice viewing and editing**
- ✅ **Search and filtering** capabilities
- ✅ **Pagination** for large datasets
- ✅ **Statistics and analytics**

### Calculator (Legacy)
- ✅ Mathematical calculations with validation
- ✅ Database persistence with MongoDB
- ✅ Real-time statistics and analytics

### General
- ✅ **Database persistence** with MongoDB
- ✅ **RESTful API endpoints**
- ✅ **Modern React UI** with Tailwind CSS
- ✅ **Error handling and validation**
- ✅ **TypeScript support**
- ✅ **Responsive design**
- ✅ **Dark mode support**

## Database Schema

### Invoice Model
```typescript
{
  invoiceNumber: string; // Auto-generated (INV-000001)
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  gstRate: number; // Default: 9%
  cgstRate: number; // Default: 9%
  gstAmount: number;
  cgstAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number; // Calculated automatically
}
```

### Calculation Model (Legacy)
```typescript
{
  operation: string;
  operands: number[];
  result: number;
  timestamp: Date;
  userId?: string;
}
```

## Usage

1. **Create Invoice**: Navigate to "Create Invoice" tab
2. **Add Customer Details**: Fill in customer information
3. **Add Items**: Add multiple items with quantities and prices
4. **Set Tax Rates**: Configure GST and CGST rates (default 9% each)
5. **Review Summary**: Check calculated totals before saving
6. **Manage Invoices**: View, edit, and track invoice status
7. **Analytics**: Monitor revenue and invoice statistics

## Tax Calculations

The system automatically calculates:
- **Subtotal**: Sum of all item totals
- **GST Amount**: Subtotal × GST Rate
- **CGST Amount**: Subtotal × CGST Rate  
- **Total Amount**: Subtotal + GST + CGST

All calculations are rounded to 2 decimal places for currency accuracy.
